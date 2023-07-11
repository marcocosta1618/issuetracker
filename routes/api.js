'use strict';
const mongoose = require('mongoose');
const IssueTracker = require('../models/IssueTracker');

module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

  app.route('/api/issues/:project')
  
    .get(async (req, res, next) => {
      const { project } = req.params;
      try {
        const doc = await IssueTracker.findOne({ project });
        // empty array if no doc found
        if (!doc) {
          res.json([]);
        } else {
          // check for no queries
          const isEmpty = obj => {
            for (const prop in obj) {
                if (Object.hasOwn(obj, prop)) {
                    return false;
                }
            }
            return true;
          }
          // all issues if no queries
          if (isEmpty(req.query)) {
            res.json(doc.issues);
          } else {
            // convert field 'open' from string to boolean, if present
            if (Object.hasOwn(req.query, 'open')) {
              req.query.open = Boolean(req.query.open);
            }
            // compare queries values with issue fields values 
            // and return issues accordingly
            const filterIssues = doc.issues.filter(issue => {
              let match = 0;
              for (const field in req.query) {
                // non-strict equality converts ObjectId to string? 
                if (req.query[field] != issue[field]) {
                  return
                } else {
                  match = 1;
                }
              }
              return match;
            })
            res.json(filterIssues);
          }
        }
      } catch(err) {
        return next(err);
      }
    })
    
    .post(async (req, res, next) => {
      const { 
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text 
      } = req.body;
      // check required fields server-side
      if (!issue_title || !issue_text || !created_by ) {
        res.json({
          error: "required field(s) missing"
        });
      } else {
        const newIssue = {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        };
        try {
          const { project } = req.params;
          const doc = await IssueTracker.findOne({ project });
          if (!doc) {
            // new doc if no doc found, then add submitted issue
            const newDoc = new IssueTracker({ project });
            newDoc.issues.push(newIssue);
            await newDoc.save();
            // respond with the newly created issue (always at pos [0] if no doc found )
            res.json(newDoc.issues[0]);
          } else {
            // push new issue if doc found, get issues count, and respond with the new issue
            const issuesCount = doc.issues.push(newIssue);
            await doc.save();
            res.json(doc.issues[issuesCount - 1]);
          }
        } catch(err) {
          return next(err);
        }
      }
    })
    
    .put(async (req, res, next) => {
      const { project } = req.params;
      const { _id } = req.body;
      // create a new obj with the fields to update (excluding _id)
      const { _id: _, ...updateFields } = req.body;
      // check for missing _id
      if (!_id) {
        res.json({
          error: "missing _id"
        })
      // check for update fields missing
      } else if
        (Object.values(updateFields).filter(elem => elem !== undefined && elem !== '').length === 0) {
          res.json({
            error: "no update field(s) sent",
            _id
          })
      } 
      else {
        try {
          // search for project and issue
          const doc = await IssueTracker.findOne({ project });
          const issueToUpdate = doc.issues.id(_id);
          // no doc with given project name or no issue found with given _id
          if (!doc || !issueToUpdate) {
            res.json({
              error: "could not update",
              _id
            })
          } else {
            // loop through the fields to update and 
            // assign the new values to the subdocument 
            for (const field in updateFields) {
              issueToUpdate[field] = updateFields[field];
            }
            // update 'updated_on' field
            issueToUpdate.updated_on = new Date().toJSON();
            await doc.save();
            res.json({
              result: "successfully updated",
              "_id": _id
            })
          }
        } catch (err) {
          return next(err);
        }
      }
    })
    
    .delete(async (req, res, next) => {
      const { project } = req.params;
      const { _id } = req.body;
      if (!_id) {
        res.json({
          error: "missing _id"
        })
      } else {
        try {
          const doc = await IssueTracker.findOne({ project });
          const issueToDelete = doc.issues.id(_id);
          if (!doc || !issueToDelete) {
            res.json({
              error: "could not delete",
              _id
            })
          } else  {
            issueToDelete.deleteOne();
            await doc.save();
            res.json({
              result: "successfully deleted",
              _id
            });
          }
        } catch(err) {
          return next(err);
        };
      };
    });
    
};
