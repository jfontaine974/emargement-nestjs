process.env.NODE_ENV = "test";
const { connectToDatabase } = require('./utils/db-connection');
var utils = require('../utils/index');

//Require the dev-dependencies
let chai = require('chai');
var expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../index');
const Referent = require('../api/models/referent-model');

var listModel = [
    Referent
];

let should = chai.should();



var cleanAll = (done) => {
    try {
        for (var i = 0; i < listModel.length; i++)
            listModel[i].collection.drop();
    } catch (error) {

    } finally {

        done();
    }
};

var dropCollection = (model) => {
    return model.collection.drop()
        .then(e => {
            return e;
        })
        .catch(e => { return e; });
};

var loadAll = (done) => {
    dropCollection(Referent).then(e => {
        Referent.insertMany(require('./data/referent.json'), (err, res) => {
            if (!err) {
                done();
            } else {
                done(err);
                console.error(err);
            }
        });
    });
};



var newRef = {
    "adresse": [
        "24 Rue d toto",
        "Montgaillard",
        "97400 Saint-Denis"
    ],
    "life_cycle": 0,
    "nom": "Eren",
    "prenom": "Ref",
    "phones": { "principal": "0692 00 00 00" },
    "remarque": "remarrefqs",
    "profession": "prof",
    "email": "ref.eren@...com"
};
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms * 1000);
    });
}

chai.use(chaiHttp);

//Our parent block
describe('========== TEST REFERENT ==========', () => {

    before((done) => {
        if (process.env.NODE_ENV != "test") {
            console.error("NODE_ENV!=test !");
            process.exit(1);
        }
        // Utiliser l'utilitaire de connexion à la base de données
        connectToDatabase(() => loadAll(done))
            .catch(e => {
                console.log(e);
                console.log("Pas connecté à la base... !");
            });

    });

    beforeEach((done) => {
        done();
    });

    after((done) => {
        cleanAll(done);
    });


    var cpt = 1;

    describe('1/ POST /referents/list', () => {
        it('it should GET all the referents !!', (done) => {
            chai.request(server)
                .post('/test/referents/list')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');

                    var data = res.body.data;
                    var expected = utils.getCopy(require('./data/referent.json'));
                    data.forEach(e => {
                        delete e.createdAt;
                        // delete e.updatedAt
                    });
                    expect(data).to.deep.equal(expected);
                    done();
                });
        });
    });

    describe('2/ PUT /referents/', () => {
        it('it should create a referent !!', (done) => {
            chai.request(server)
                .put('/test/referents')
                .send(newRef)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');

                    var data = res.body.data;
                    delete data._id;
                    delete data.createdAt;
                    delete data.updatedAt;
                    data.life_cycle = 0;
                    expect(data).to.deep.equal(newRef);
                    chai.request(server)
                        .post('/test/referents/list')
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(200);
                            var recup = res.body.data;

                            var expected = utils.getCopy(require('./data/referent.json'));
                            expected.push(newRef);
                            expected.forEach(e => {
                                delete e._id;
                                delete e.createdAt;
                                delete e.updatedAt;
                            });
                            recup.forEach(e => {
                                delete e._id;
                                delete e.createdAt;
                                delete e.updatedAt;
                            });
                            expect(recup).to.deep.equal(expected);
                            loadAll(done);
                        });
                });
        });
    });



    describe('3/ PUT /referents/{id}', () => {
        var id = utils.getCopy(require('./data/referent.json')).filter(e => e._id == "60f688106fcecbb9371a9004")[0]._id;
        var update = {
            prenom: "jesuisunprenom",
            nom: "jesuisunnom"
        };
        var expected = utils.getCopy(require('./data/referent.json'));

        expected.filter(e => e._id == "60f688106fcecbb9371a9004")[0].prenom = update.prenom;
        expected.filter(e => e._id == "60f688106fcecbb9371a9004")[0].nom = update.nom;

        console.log(expected);
        it('it should update a referent !!', (done) => {
            chai.request(server)
                .put('/test/referents/' + id)
                .send(update)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');


                    chai.request(server)
                        .post('/test/referents/list')
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(200);
                            var recup = res.body.data;

                            // expected.push(newRef)

                            expected.forEach(e => {
                                delete e._id;
                                delete e.createdAt;
                                delete e.updatedAt;
                            });
                            recup.forEach(e => {
                                delete e._id;
                                delete e.createdAt;
                                delete e.updatedAt;
                            });
                            expect(recup).to.deep.equal(expected);
                            loadAll(done);
                        });
                });
        });
    });

    describe('4/ Test fusion des phones', () => {
        it('should merge phones fields correctly', (done) => {
            // Créer un référent avec phones initial
            const initialRef = {
                nom: "TestPhones",
                prenom: "Fusion",
                phone: "0693840221",
                phones: {
                    mobile: "0693840221",
                    maison: "0262123456"
                }
            };

            // Créer le référent
            chai.request(server)
                .put('/test/referents')
                .send(initialRef)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    const refId = res.body.data._id;

                    // Test 1: Ajouter de nouveaux champs sans perdre les anciens
                    chai.request(server)
                        .put('/test/referents/' + refId)
                        .send({
                            phones: {
                                ppp: "0692025588",
                                test: "0788454489"
                            }
                        })
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(200);

                            // Vérifier que tous les champs sont présents
                            const phones = res.body.data.phones;
                            expect(phones).to.have.property('mobile', '0693840221');
                            expect(phones).to.have.property('maison', '0262123456');
                            expect(phones).to.have.property('ppp', '0692025588');
                            expect(phones).to.have.property('test', '0788454489');
                            expect(phones).to.have.property('principal', '0693840221');

                            // Test 2: Mise à jour d'un champ existant
                            chai.request(server)
                                .put('/test/referents/' + refId)
                                .send({
                                    phones: {
                                        ppp: "0692999999"
                                    }
                                })
                                .end((err, res) => {
                                    if (err) done(err);
                                    res.should.have.status(200);

                                    // Vérifier que ppp est mis à jour et les autres conservés
                                    const phones2 = res.body.data.phones;
                                    expect(phones2).to.have.property('ppp', '0692999999');
                                    expect(phones2).to.have.property('test', '0788454489');
                                    expect(phones2).to.have.property('mobile', '0693840221');
                                    expect(phones2).to.have.property('maison', '0262123456');

                                    // Test 3: Suppression du principal
                                    chai.request(server)
                                        .put('/test/referents/' + refId)
                                        .send({
                                            phones: {
                                                principal: ""
                                            }
                                        })
                                        .end((err, res) => {
                                            if (err) done(err);
                                            res.should.have.status(200);

                                            // Vérifier que principal n'apparaît plus
                                            const phones3 = res.body.data.phones;
                                            expect(phones3).to.not.have.property('principal');
                                            expect(phones3).to.have.property('ppp');
                                            expect(phones3).to.have.property('test');

                                            // Nettoyer
                                            chai.request(server)
                                                .delete('/test/referents/' + refId)
                                                .end((err, res) => {
                                                    loadAll(done);
                                                });
                                        });
                                });
                        });
                });
        });
    });

    describe('5/ POST /referents/list/:date', () => {



        it('it should list referent from date!', (done) => {
            var date = "2021-05-17T23:53:51.418Z";
            chai.request(server)
                .post('/test/referents/list/' + date)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);

                    var exCate = utils.getCopy(require('./data/referent.json')).filter(u => u.updatedAt > date);

                    res.body.data.forEach(e => delete e.createdAt);
                    expect(res.body.data).to.deep.equals(exCate);
                    done();

                });


        });
    });


});
