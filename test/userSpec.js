process.env.NODE_ENV = 'test';
var { mongoConf } = require('../config/conf');
const { mongooseService } = require('../services/mongoose-service');
var mongoose = require('mongoose');
var utils = require('../utils/index');
const { connectToDatabase } = require('./utils/db-connection');

//Require the dev-dependencies
let chai = require('chai');
var expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../index');
const User = require('../api/models/user-model');
const UserCategorie = require('../api/models/user-categorie-model');
const Categorie = require('../api/models/categorie-model');
const Session = require('../api/models/session-model');
const optionsConnection = require('./conf/option-connection');
let should = chai.should();

var dropCollection = (model) => {
  return model.collection
    .drop()
    .then((e) => {
      return e;
    })
    .catch((e) => {
      return e;
    });
};

var loadAll = (done) => {
  dropCollection(User).then((e) => {
    dropCollection(Categorie).then((e) => {
      dropCollection(UserCategorie).then((e) => {
        User.insertMany(require('./data/user.json'), (err, res) => {
          if (!err) {
            Categorie.insertMany(
              require('./data/categorie.json'),
              (err, res) => {
                if (!err) {
                  UserCategorie.insertMany(
                    require('./data/user-categorie.json'),
                    (err, res) => {
                      if (!err) {
                        done();
                      } else {
                        console.error(err);
                      }
                    },
                  );
                } else {
                  console.error(err);
                }
              },
            );
          } else {
            console.error(err);
          }
        });
      });
    });
  });
};

chai.use(chaiHttp);
//Our parent block
describe('========== TEST USERS ==========', () => {
  before((done) => {
    if (process.env.NODE_ENV != 'test') {
      console.error('NODE_ENV!=test !');
      process.exit(1);
    }
    connectToDatabase(() => loadAll(done)).catch((e) => {
      console.log(e);
      console.log('Pas connecté à la base... !');
    });
  });

  beforeEach((done) => {
    done();
  });

  after((done) => {
    try {
      dropCollection(User);
      dropCollection(Categorie);
      dropCollection(UserCategorie);
    } catch (error) {
    } finally {
      done();
    }
  });

  describe('0/ POST /users/list/:date', () => {
    it('it should list users from date!', (done) => {
      var date = '2021-05-17T23:53:51.418Z';
      chai
        .request(server)
        .post('/test/users/list/' + date)
        .end((err, res) => {
          if (err) done(err);
          res.should.have.status(200);

          var exCate = utils
            .getCopy(require('./data/user.json'))
            .filter((u) => u.updatedAt > date);

          res.body.data.forEach((e) => delete e.createdAt);
          var recup = res.body.data.map((e) => e.user).map((e) => e._id);
          var ex = exCate.map((e) => e._id);

          expect(ex).to.deep.equals(recup);
          done();
        });
    });
  });

  describe('1/ POST /users/list', () => {
    it('it should GET all the users !!', (done) => {
      chai
        .request(server)
        .post('/test/users/list')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.all.keys('ret', 'data');
          var r = res.body.data;
          r.forEach((e) => delete e._id);
          var exUser = require('./data/user.json').filter(
            (u) => u.life_cycle < 9,
          );
          var catsUser = require('./data/user-categorie.json').filter(
            (u) => u.life_cycle < 9,
          );
          var catsOff = require('./data/categorie.json')
            .filter((u) => u.life_cycle == 9)
            .map((e) => e._id);
          var ex = [];
          exUser.forEach((u) => {
            var catsId = catsUser
              .filter((c) => c.id_user == u._id && c.life_cycle < 9)
              .map((e) => e.id_categorie)
              .filter((a) => catsOff.filter((b) => a == b).length == 0);
            delete u.password;
            ex.push({
              user: u,
              categories_id: catsId,
            });
          });
          expect(r).to.deep.equals(ex);
          done();
        });
    });
  });

  describe('2/ PUT /users', () => {
    it('it should create an user!!', (done) => {
      var newUser = {
        identifiant: 'user',
        password: 'test',
      };
      chai
        .request(server)
        .put('/test/users/')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.all.keys('ret', 'data');
          var r = res.body.data;
          var ex = newUser;
          ex.role = 'OPER';
          ex.life_cycle = 0;
          delete ex.password;
          var idNew = r._id;
          delete r._id;
          delete r.createdAt;
          delete r.updatedAt;
          expect(r).to.deep.equals(ex);
          chai
            .request(server)
            .post('/test/users/list')
            .end((err, res) => {
              res.should.have.status(200);
              expect(res.body).to.have.all.keys('ret', 'data');
              var r = res.body.data.map((e) => e.user);
              r.forEach((e) => {
                // delete e._id
                delete e.createdAt;
                delete e.updatedAt;
              });
              var ex = require('./data/user.json').filter(
                (u) => u.life_cycle < 9,
              );
              ex.forEach((e) => {
                delete e.password;
                delete e.updatedAt;
              });
              newUser._id = idNew;
              ex.push(newUser);
              expect(r).to.deep.equals(ex);
              done();
            });
        });
    });
  });

  describe('3/ POST /users/login', () => {
    it('it should login an user!!', (done) => {
      var user = {
        identifiant: 'user',
        password: 'test',
      };
      chai
        .request(server)
        .post('/test/users/login')
        .send(user)
        .end((err, res) => {
          // console.log("BODY ::::: ====>");
          // console.log(res.body);
          res.should.have.status(200);
          //   console.log(Object.keys(res.body));
          expect(Object.keys(res.body)).to.have.lengthOf(6);
          expect(res.body).to.have.property('ret');
          expect(res.body).to.have.property('accessToken');
          expect(res.body).to.have.property('userId');
          expect(res.body).to.have.property('xsrfToken');
          expect(res.body).to.have.property('id_session');
          var tokenExp = res.header['set-cookie'][0]
            .split('access_token=')[1]
            .split(';')[0];
          expect(res.body.accessToken).to.equal(tokenExp);
          done();
        });
    });
  });

  describe('4/ PUT /users/:id', () => {
    it('it should update an user!!', (done) => {
      var identifiant = 'user';
      var set = {
        nom: 'Bon' + new Date(),
        prenom: 'Jean' + new Date(),
        role: 'ADMIN',
      };
      User.findOne({ identifiant }).then((u) => {
        chai
          .request(server)
          .put('/test/users/' + u._id)
          .send(set)
          .end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.all.keys('ret', 'data');
            var r = res.body.data;
            expect(r.role).to.equal(set.role);
            expect(r.prenom).to.equal(set.prenom);
            expect(r.nom).to.equal(set.nom);
            chai
              .request(server)
              .post('/test/users/list')
              .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.have.all.keys('ret', 'data');
                var r = res.body.data.map((e) => e.user);
                var ex = r.filter((e) => e.identifiant == identifiant)[0];
                expect(set.nom).to.equal(ex.nom);
                expect(set.prenom).to.equal(ex.prenom);
                expect(ex.identifiant).to.equal(identifiant);
                done();
              });
          });
      });
    });
  });

  describe('5/ PUT /users/:id/password', () => {
    it('it should update password user !!', (done) => {
      var pass = {
        password: 'toto',
      };
      User.findOne({ identifiant: 'user' }).then((u) => {
        chai
          .request(server)
          .put('/test/users/' + u._id + '/password')
          .send(pass)
          .end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.all.keys('ret', 'data');
            // var r = res.body.data
            var user = {
              identifiant: 'user',
              password: pass.password,
            };
            chai
              .request(server)
              .post('/test/users/login')
              .send(user)
              .end((err, res) => {
                res.should.have.status(200);
                done();
              });
          });
      });
    });
  });

  describe('6/ PATCH /users/:id/disable', () => {
    var identifiant = 'user';
    it('it should disable an user!!', (done) => {
      User.findOne({ identifiant }).then((u) => {
        expect(u.life_cycle).to.equal(0);
        chai
          .request(server)
          .patch('/test/users/' + u._id + '/disable')
          .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.data.life_cycle).to.equal(9);
            chai
              .request(server)
              .post('/test/users/list')
              .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.have.all.keys('ret', 'data');
                var r = res.body.data.map((e) => e.user);
                var ex = r.filter((e) => e.identifiant == identifiant);
                expect(ex).to.deep.equals([]);
                done();
              });
          });
      });
    });
  });

  describe('7/ PATCH /users/:id/enable', () => {
    var identifiant = 'user';
    it('it should enable an user!!', (done) => {
      User.findOne({ identifiant }).then((u) => {
        expect(u.life_cycle).to.equal(9);
        chai
          .request(server)
          .patch('/test/users/' + u._id + '/enable')
          .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.data.life_cycle).to.equal(0);
            chai
              .request(server)
              .post('/test/users/list')
              .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.have.all.keys('ret', 'data');
                var r = res.body.data.map((e) => e.user);
                var ex = r.filter((e) => e.identifiant == identifiant);
                expect(ex.length).to.equal(1);
                done();
              });
          });
      });
    });
  });

  describe('8/ POST /users/:id/cats', () => {
    var id_user = utils.getCopy(require('./data/user-categorie.json'))[0]
      .id_user;
    it('it should list categories of a user', (done) => {
      chai
        .request(server)
        .post('/test/users/' + id_user + '/cats')
        .end((err, res) => {
          res.should.have.status(200);
          var r = res.body.data;
          var catsId = utils
            .getCopy(require('./data/user-categorie.json'))
            .filter((c) => c.life_cycle < 9 && c.id_user == id_user)
            .map((e) => e.id_categorie);
          var cats = utils
            .getCopy(require('./data/categorie.json'))
            .filter((c) => catsId.filter((id) => id == c._id).length > 0);

          // Supprimer les champs dynamiques pour la comparaison
          // (createdAt est ajouté par mongoose timestamps, archivedBatchId par defaut du schema)
          r.forEach((e) => {
            delete e.createdAt;
            delete e.archivedBatchId;
          });
          cats.forEach((e) => {
            delete e.createdAt;
            delete e.archivedBatchId;
          });
          expect(r).to.deep.equals(cats);
          done();
        });
    });
  });

  describe('9/ POST /users/:id', () => {
    var id_user = utils.getCopy(require('./data/user.json'))[0]._id;
    it('it should get one user', (done) => {
      chai
        .request(server)
        .post('/test/users/' + id_user)
        .end((err, res) => {
          res.should.have.status(200);
          var r = res.body.data;
          var ex = utils
            .getCopy(require('./data/user.json'))
            .filter((u) => u._id == id_user)[0];
          delete ex.updatedAt;
          delete r.updatedAt;
          expect(r).to.deep.equals(ex);
          done();
        });
    });
  });
});
