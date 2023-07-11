const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const issueSchema = new Schema({
    issue_title: {
        type: String,
    },
    issue_text: {
        type: String,
    },
    created_by: {
        type: String,
    },
    created_on: {
        type: String, 
        default: new Date().toJSON()
    },
    updated_on: {
        type: String,
        default: new Date().toJSON()
    },
    assigned_to: {
        type: String,
        default: ""
    },
    open: {
        type: Boolean,
        default: true
    },
    status_text: {
        type: String,
        default: ""
    }
});

const issueTrackerSchema = new Schema({
    project: String,
    // array of subdocuments
    issues: [issueSchema]
});

const IssueTracker = model('IssueTracker', issueTrackerSchema);

module.exports = IssueTracker;