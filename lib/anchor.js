module.exports = function (
  {
    conditions={},
    fields=null,
    options={},
    limit=10,
    anchorId,
    lean=false
  }, callback) {

  const model = this;

  // set pagination filters
  if (anchorId) conditions._id = { $gte: anchorId };
  if (limit) options.limit = limit + 1;

  //initialize query
  let query = model.find(conditions, fields, options);

  //give options to lean if desired
  if(lean) query.lean();

  return query.exec(function (err, docs) {

    if (err) return callback(err);

    const result = {};

    if(docs.length === 0){
      result.documents = [];
      result.pagesRemaining = 0;
      return callback(err, result);
    }

    //The main results from the DB
    result.documents = docs;

    return model.count(conditions, function (err, count) {

      if (limit) {
        result.pagesRemaining = Math.ceil(count / limit);
      } else {
        result.pagesRemaining = 0;
      }

      if (result.pagesRemaining > 1) {
          //result.prevAnchorId = anchorId;
          //result.nextAnchorId = docs[ docs.length - 1 ]._id.toString();

          //Get the first result of next page, rather than last result of current page
          result.nextAnchorId = result.documents.pop()._id.toString();
      }

      return callback(err, result);

    });

  });
}
