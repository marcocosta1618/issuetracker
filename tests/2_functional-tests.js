const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

    suite('Routing Tests', () => {

        const project = 'chaiTesting';
        let testIssue1_id;
        let testIssue2_id;
        const invalid_id = 'xxxxxxxxxxxxxxxxxxxxxxxx';

        suite('POST requests to /api/issues/{project}', () => {
            
            test('create an issue with every field => create issue obj/expect issue obj', done => {
                const fields = {
                    issue_title: 'chaiTest_1',
                    issue_text: 'chaiTest_1 text',
                    created_by: 'chai',
                    assigned_to: 'mc',
                    status_text: 'in progress'
                };

                chai.request(server)
                    .keepOpen()
                    .post(`/api/issues/${project}`)
                    .send(fields)
                    .end((err, res) => {
                        testIssue1_id = res.body._id;
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.isObject(res.body, 'body should be the issue object');
                        assert.property(res.body, '_id', 'body should contain _id');
                        assert.equal(res.body.issue_title, fields.issue_title, `issue_title should be ${fields.issue_title}`);
                        assert.equal(res.body.issue_text, fields.issue_text, `issue_text should be ${fields.issue_text}`);
                        assert.equal(res.body.created_by, fields.created_by, `created_by should be ${fields.created_by}`);
                        assert.equal(res.body.assigned_to, fields.assigned_to, `assigned_to should be ${fields.assigned_to}`);
                        assert.equal(res.body.status_text, fields.status_text, `status_text should be ${fields.status_text}`);
                        assert.equal(res.body.open, true, `open should be true`);
                        assert.property(res.body, 'created_on', 'body should contain created_on');
                        assert.property(res.body, 'updated_on', 'body should contain updated_on');
                        done();
                    });
            });

            test('create an issue with only required fields => create issue obj/expect issue obj', done => {
                const fields = {
                    issue_title: 'chaiTest_2',
                    issue_text: 'chaiTest_2 text',
                    created_by: 'chai'
                };

                chai.request(server)
                    .keepOpen()
                    .post(`/api/issues/${project}`)
                    .send(fields)
                    .end((err, res) => {
                        testIssue2_id = res.body._id;
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.isObject(res.body, 'body should be the issue object');
                        assert.property(res.body, '_id', 'body should contain _id');
                        assert.equal(res.body.issue_title, fields.issue_title, `issue_title should be ${fields.issue_title}`);
                        assert.equal(res.body.issue_text, fields.issue_text, `issue_text should be ${fields.issue_text}`);
                        assert.equal(res.body.created_by, fields.created_by, `created_by should be ${fields.created_by}`);
                        assert.equal(res.body.assigned_to, "", 'assigned_to should be an empty string');
                        assert.equal(res.body.status_text, "", 'status_text should be an empty string');
                        assert.equal(res.body.open, true, `open should be true`);
                        assert.property(res.body, 'created_on', 'body should contain created_on');
                        assert.property(res.body, 'updated_on', 'body should contain updated_on');
                        done();
                    });
            });

            test('create an issue with missing required fields => expect error', done => {
                const missingFields = {
                    created_by: "Alan Turing"
                };
                const expected = {
                    error: 'required field(s) missing'
                };

                chai.request(server)
                    .keepOpen()
                    .post(`/api/issues/${project}`)
                    .send(missingFields)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.isObject(res.body);
                        assert.property(res.body, 'error');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });
        });

        suite('GET request to /api/issues/{project}', () => {

            test('view all issues => expect array of issues', done => {
                chai.request(server)
                    .keepOpen()
                    .get(`/api/issues/${project}`)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.isArray(res.body, 'body should be an array');
                        assert.hasAllKeys(res.body[0], [
                            '_id',
                            'issue_title',
                            'issue_text',
                            'created_by',
                            'created_on',
                            'updated_on',
                            'assigned_to',
                            'open',
                            'status_text'
                        ], 'issue object created by test should contain all fields');
                        done();
                    });
            });

            test('view issue(s) on a project with one filter => expect filtered issue(s) array', done => {

                const filter = 'created_by';
                const filterVal = 'chai';
                chai.request(server)
                .keepOpen()
                .get(`/api/issues/${project}/?${filter}=${filterVal}`)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.isArray(res.body, 'body should be an array');
                    assert.propertyVal(res.body[res.body.length - 1], filter, filterVal, `returned issue ${filter} field should be ${filterVal}`);
                    done();
                });
            });

            test('view issue(s) on a project with multiple filters => expect filtered issue(s) array', done => {

                const filter1 = 'issue_title';
                const filter2 = 'assigned_to';
                const filterVal1 = 'chaiTest_1';
                const filterVal2 = 'mc';

                chai.request(server)
                    .keepOpen()
                    .get(`/api/issues/${project}/?${filter1}=${filterVal1}&${filter2}=${filterVal2}`)
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.equal(res.type, 'application/json');
                        assert.isArray(res.body, 'Body should be an array');
                        assert.propertyVal(res.body[res.body.length - 1], filter1, filterVal1, `returned issue ${filter1} field should be ${filterVal1}`);
                        assert.propertyVal(res.body[res.body.length - 1], filter2, filterVal2, `returned issue ${filter2} field should be ${filterVal2}`);
                        done();
                    });
            });
        });

        suite('PUT request to /api/issues/{project}', () => {

            test('update one field on an issue => ', done => {

                const update = {
                    _id: testIssue1_id,
                    assigned_to: 'Alan Turing'
                };
                const expected = {
                    'result': 'successfully updated',
                    '_id': testIssue1_id
                };

                chai.request(server)
                    .keepOpen()
                    .put(`/api/issues/${project}`)
                    .send(update)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });

            test('update multiple fields on an issue => expect successful update', done => {

                const update = {
                    _id: testIssue2_id,
                    assigned_to: 'Isaac Asimov',
                    issue_text: 'chaiTesting update'
                };
                const expected = {
                    result: 'successfully updated',
                    _id: testIssue2_id
                };

                chai.request(server)
                    .keepOpen()
                    .put(`/api/issues/${project}`)
                    .send(update)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });

            test('update an issue with missing _id => expect error', done => {

                const no_idUpdate = {
                    _id: undefined,
                    issueTitle: 'missing _id'
                };
                const expected = {
                    error: 'missing _id',
                };

                chai.request(server)
                    .keepOpen()
                    .put(`/api/issues/${project}`)
                    .send(no_idUpdate)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });

            test('update an issue with no fields to update => expect error', done => {

                const noFields = {
                    _id: testIssue1_id
                };
                const expected = {
                    error: 'no update field(s) sent',
                    _id: testIssue1_id
                };

                chai.request(server)
                    .keepOpen()
                    .put(`/api/issues/${project}`)
                    .send(noFields)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });

            test('update an issue with an invalid _id => expect error', done => {

                const invalid_idUpdate = {
                    _id: invalid_id,
                    issue_text: 'this text should not update'
                };
                const expected = {
                    error: 'could not update',
                    _id: invalid_id
                };

                chai.request(server)
                    .keepOpen()
                    .put(`/api/issues/${project}`)
                    .send(invalid_idUpdate)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });
        });

        suite('DELETE request to /api/issues/{project}', () => {

            test('delete an issue => expect successful delete', done => {

                const issueToDelete = {
                    _id: testIssue2_id
                };
                const expected = {
                    result: 'successfully deleted',
                    _id: testIssue2_id
                };

                chai.request(server)
                    .keepOpen()
                    .delete(`/api/issues/${project}`)
                    .send(issueToDelete)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });

            test('delete an issue with an invalid _id => expect error', done => {

                const invalid_idIssue = {
                    _id: invalid_id
                };
                const expected = {
                    error: 'could not delete',
                    _id: invalid_id
                };

                chai.request(server)
                .keepOpen()
                .delete(`/api/issues/${project}`)
                .send(invalid_idIssue)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.deepEqual(res.body, expected);
                    done();
                });
            });

            test('delete an issue with missing _id => expect error', done => {

                const missing_id = {
                    _id: ''
                };
                const expected = {
                    error: 'missing _id'
                };

                chai.request(server)
                    .keepOpen()
                    .delete(`/api/issues/${project}`)
                    .send(missing_id)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.type, 'application/json');
                        assert.deepEqual(res.body, expected);
                        done();
                    });
            });
        });
    });
  
});
