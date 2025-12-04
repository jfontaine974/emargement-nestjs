process.env.NODE_ENV = 'test';
var {mongoConf} = require('../config/conf');
const {mongooseService} = require('../services/mongoose-service');
var mongoose = require('mongoose');
var utils = require('../utils/index');
const { connectToDatabase } = require('./utils/db-connection');

let chai = require('chai');
var expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../index');
const Implantation = require('../api/models/implantation-model');
const optionsConnection = require('./conf/option-connection');
const axios = require('axios');
const sinon = require('sinon');

let should = chai.should();
const newImplantation = {
    nom: 'Site du Port',
    alias: 'PORT',
    adresse: '123 rue du Port, 97420 Le Port',
    remarque: 'Près de la médiathèque',
    ecole: {
        nom_etablissement: 'Ecole élémentaire publique Raoul Fruteau',
        adresse_1: '123 rue de l\'école',
        adresse_2: 'Bâtiment A',
        adresse_3: 'Étage 1',
        code_postal: '97420',
        nom_commune: 'Le Port',
        identifiant_de_l_etablissement: '9740008R'
    }
};

var listModel = [
    Implantation
];

var cleanAll = (done) => {
    try {
        for (var i = 0; i < listModel.length; i++)
            listModel[i].collection.drop();
    } catch (error) {
        // Ignorer l'erreur si la collection n'existe pas
    } finally {
        done();
    }
};

var loadAll = (done) => {
    try {
        // Nettoyer d'abord la collection si elle existe
        Implantation.collection.drop().catch(err => {
            // Ignorer l'erreur si la collection n'existe pas encore
        }).finally(() => {
            // Insérer les données de test
            Implantation.insertMany(require('./data/implantation.json'), (err, res) => {
                if (!err) {
                    done();
                } else {
                    console.error(err);
                    done(err);
                }
            });
        });
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        done(error);
    }
};

// Données mockées pour le test de l'API des écoles
const mockEcolesData = {
    results: [
        {
            nom_etablissement: 'Ecole maternelle publique Charles Isautier',
            adresse_1: '45 rue de l\'école',
            adresse_2: 'Bâtiment B',
            adresse_3: 'Étage 2',
            code_postal: '97430',
            nom_commune: 'Le Tampon',
            identifiant_de_l_etablissement: '9741874U'
        },
        {
            nom_etablissement: 'Ecole élémentaire publique Raymond Mondon',
            adresse_1: '78 rue de l\'école',
            adresse_2: 'Bâtiment C',
            adresse_3: 'Étage 3',
            code_postal: '97400',
            nom_commune: 'Saint-Denis',
            identifiant_de_l_etablissement: '9740001H'
        },
        {
            nom_etablissement: 'Ecole primaire privée Saint Michel',
            adresse_1: '12 rue de l\'école',
            adresse_2: 'Bâtiment D',
            adresse_3: 'Étage 4',
            code_postal: '97410',
            nom_commune: 'Saint-Pierre',
            identifiant_de_l_etablissement: '9741082K'
        }
    ]
};

chai.use(chaiHttp);

//Our parent block
describe('========== TEST IMPLANTATIONS ==========', () => {

    before((done) => {
        if (process.env.NODE_ENV != 'test') {
            console.error('NODE_ENV!=test !');
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

    describe('1/ POST /implantations/list', () => {
        it('it should GET all the implantations', (done) => {
            chai.request(server)
                .post('/test/implantations/list')
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    var r = res.body.data;

                    var expectedImplantations = utils.getCopy(require('./data/implantation.json'));

                    // Vérifier que les données reçues correspondent aux données attendues
                    expect(r).to.deep.equals(expectedImplantations);
                    done();
                });
        });
    });

    describe('2/ PUT /implantations', () => {
        it('it should create a new implantation', (done) => {
            chai.request(server)
                .put('/test/implantations/')
                .send(newImplantation)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    var r = res.body.data;

                    // Vérifier que les données créées correspondent aux données envoyées
                    expect(r.nom).to.equal(newImplantation.nom);
                    expect(r.alias).to.equal(newImplantation.alias);
                    expect(r.adresse).to.equal(newImplantation.adresse);
                    expect(r.remarque).to.equal(newImplantation.remarque);
                    expect(r.ecole).to.deep.equal(newImplantation.ecole);

                    // Vérifier que la nouvelle implantation est bien dans la liste
                    chai.request(server)
                        .post('/test/implantations/list')
                        .end((err, res) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            res.should.have.status(200);

                            // Vérifier que la liste inclut maintenant la nouvelle implantation
                            var implantationsList = res.body.data;
                            var found = implantationsList.some(imp =>
                                imp.nom === newImplantation.nom &&
                                imp.alias === newImplantation.alias);

                            expect(found).to.be.true;
                            done();
                        });
                });
        });

        it('it should correctly handle the new address fields (adresse_1, adresse_2, adresse_3)', (done) => {
            const implantationWithAddress = {
                nom: 'Site avec adresse détaillée',
                alias: 'ADDR',
                adresse: '123 rue principale, 97400 Saint-Denis',
                remarque: 'Test des champs d\'adresse',
                ecole: {
                    nom_etablissement: 'Ecole test',
                    adresse_1: '123 rue principale',
                    adresse_2: 'Bâtiment C',
                    adresse_3: 'Étage 3',
                    code_postal: '97400',
                    nom_commune: 'Saint-Denis',
                    identifiant_de_l_etablissement: '9740000X'
                }
            };

            chai.request(server)
                .put('/test/implantations/')
                .send(implantationWithAddress)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    const r = res.body.data;

                    // Vérifier que les champs d'adresse sont correctement enregistrés
                    expect(r.ecole.adresse_1).to.equal(implantationWithAddress.ecole.adresse_1);
                    expect(r.ecole.adresse_2).to.equal(implantationWithAddress.ecole.adresse_2);
                    expect(r.ecole.adresse_3).to.equal(implantationWithAddress.ecole.adresse_3);

                    // Vérifier que l'implantation est bien dans la liste avec les bons champs d'adresse
                    chai.request(server)
                        .post('/test/implantations/list')
                        .end((err, res) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            res.should.have.status(200);
                            const implantationsList = res.body.data;
                            const found = implantationsList.some(imp => 
                                imp.nom === implantationWithAddress.nom && 
                                imp.ecole.adresse_1 === implantationWithAddress.ecole.adresse_1 &&
                                imp.ecole.adresse_2 === implantationWithAddress.ecole.adresse_2 &&
                                imp.ecole.adresse_3 === implantationWithAddress.ecole.adresse_3
                            );

                            expect(found).to.be.true;
                            done();
                        });
                });
        });

        it('it should create a new implantation with the specific school information', (done) => {
            const specificSchoolImplantation = {
                nom: 'Ecole maternelle publique les Capucines',
                alias: 'CAPU',
                adresse: '100 impasse Lacoaret, 97440 Saint-André',
                remarque: 'École maternelle',
                ecole: {
                    nom_etablissement: 'Ecole maternelle publique les Capucines',
                    adresse_1: '100 impasse Lacoaret',
                    adresse_2: '',
                    adresse_3: '97440 ST ANDRE',
                    code_postal: '97440',
                    nom_commune: 'Saint-André',
                    identifiant_de_l_etablissement: '9740150V'
                }
            };

            chai.request(server)
                .put('/test/implantations/')
                .send(specificSchoolImplantation)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    const r = res.body.data;

                    // Vérifier que les données créées correspondent aux données envoyées
                    expect(r.nom).to.equal(specificSchoolImplantation.nom);
                    expect(r.alias).to.equal(specificSchoolImplantation.alias);
                    expect(r.adresse).to.equal(specificSchoolImplantation.adresse);
                    expect(r.remarque).to.equal(specificSchoolImplantation.remarque);
                    
                    // Vérifier spécifiquement les informations de l'école
                    expect(r.ecole.nom_etablissement).to.equal(specificSchoolImplantation.ecole.nom_etablissement);
                    expect(r.ecole.adresse_1).to.equal(specificSchoolImplantation.ecole.adresse_1);
                    expect(r.ecole.adresse_2).to.equal(specificSchoolImplantation.ecole.adresse_2);
                    expect(r.ecole.adresse_3).to.equal(specificSchoolImplantation.ecole.adresse_3);
                    expect(r.ecole.code_postal).to.equal(specificSchoolImplantation.ecole.code_postal);
                    expect(r.ecole.nom_commune).to.equal(specificSchoolImplantation.ecole.nom_commune);
                    expect(r.ecole.identifiant_de_l_etablissement).to.equal(specificSchoolImplantation.ecole.identifiant_de_l_etablissement);

                    // Vérifier que la nouvelle implantation est bien dans la liste
                    chai.request(server)
                        .post('/test/implantations/list')
                        .end((err, res) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            res.should.have.status(200);
                            const implantationsList = res.body.data;
                            const found = implantationsList.some(imp => 
                                imp.nom === specificSchoolImplantation.nom && 
                                imp.ecole.identifiant_de_l_etablissement === specificSchoolImplantation.ecole.identifiant_de_l_etablissement
                            );

                            expect(found).to.be.true;
                            done();
                        });
                });
        });
    });

    const sinon = require('sinon');
    const fs = require('fs');
    
    describe('3/ POST /implantations/ecoles', () => {
        let readFileStub;
        const mockData = JSON.stringify([
            {
                nom_etablissement: 'Ecole maternelle publique Charles Isautier',
                adresse_1: '45 rue de l\'école',
                adresse_2: 'Bâtiment B',
                adresse_3: 'Étage 2',
                code_postal: '97430',
                nom_commune: 'Le Tampon',
                identifiant_de_l_etablissement: '9741874U'
            },
            {
                nom_etablissement: 'Ecole élémentaire publique Raymond Mondon',
                adresse_1: '78 rue de l\'école',
                adresse_2: 'Bâtiment C',
                adresse_3: 'Étage 3',
                code_postal: '97400',
                nom_commune: 'Saint-Denis',
                identifiant_de_l_etablissement: '9740001H'
            },
            {
                nom_etablissement: 'Ecole primaire privée Saint Michel',
                adresse_1: '12 rue de l\'école',
                adresse_2: 'Bâtiment D',
                adresse_3: 'Étage 4',
                code_postal: '97410',
                nom_commune: 'Saint-Pierre',
                identifiant_de_l_etablissement: '9741082K'
            }
        ]);
    
        before(() => {
            // Simuler fs.readFile pour retourner des données simulées
            readFileStub = sinon.stub(fs, 'readFile').callsFake((path, encoding, callback) => {
                callback(null, mockData);
            });
        });
    
        after(() => {
            // Restaurer fs.readFile à son comportement d'origine
            readFileStub.restore();
        });
    
        it('it should GET all schools from the local JSON file', (done) => {
            chai.request(server)
                .post('/test/implantations/ecoles')
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }
    
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
    
                    // Vérifier que les données reçues correspondent aux données simulées
                    const expectedEcoles = JSON.parse(mockData);
                    expect(res.body.data).to.deep.equal(expectedEcoles);
    
                    done();
                });
        });
    });

    describe('4/ PUT /implantations/:id', () => {
        let implantationId;

        beforeEach((done) => {
            // Créer une implantation de test pour la mise à jour
            const implantation = new Implantation(newImplantation);
            implantation.save()
                .then(saved => {
                    implantationId = saved._id;
                    done();
                })
                .catch(done);
        });

        it('it should update an existing implantation', (done) => {
            const updatedData = {
                nom: 'Site du Port Modifié',
                alias: 'PORT-MOD',
                adresse: '456 rue du Port, 97420 Le Port',
                remarque: 'Nouvelle remarque',
                ecole: {
                    nom_etablissement: 'Ecole élémentaire publique Raoul Fruteau',
                    adresse_1: '456 rue de l\'école',
                    adresse_2: 'Bâtiment E',
                    adresse_3: 'Étage 5',
                    code_postal: '97420',
                    nom_commune: 'Le Port',
                    identifiant_de_l_etablissement: '9740008R'
                }
            };

            chai.request(server)
                .put(`/test/implantations/${implantationId}`)
                .send(updatedData)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    const updatedImplantation = res.body.data;

                    // Vérifier que les données mises à jour correspondent aux données envoyées
                    expect(updatedImplantation.nom).to.equal(updatedData.nom);
                    expect(updatedImplantation.alias).to.equal(updatedData.alias);
                    expect(updatedImplantation.adresse).to.equal(updatedData.adresse);
                    expect(updatedImplantation.remarque).to.equal(updatedData.remarque);
                    expect(updatedImplantation.ecole).to.deep.equal(updatedData.ecole);

                    // Vérifier que l'implantation est bien mise à jour dans la liste
                    chai.request(server)
                        .post('/test/implantations/list')
                        .end((err, res) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            res.should.have.status(200);
                            const implantationsList = res.body.data;
                            const found = implantationsList.some(imp => 
                                imp._id.toString() === implantationId.toString() && 
                                imp.nom === updatedData.nom
                            );

                            expect(found).to.be.true;
                            done();
                        });
                });
        });

        it('it should correctly update the new address fields (adresse_1, adresse_2, adresse_3)', (done) => {
            const updatedAddressData = {
                nom: 'Site du Port',
                alias: 'PORT',
                adresse: '123 rue du Port, 97420 Le Port',
                remarque: 'Près de la médiathèque',
                ecole: {
                    nom_etablissement: 'Ecole élémentaire publique Raoul Fruteau',
                    adresse_1: '123 rue de l\'école',
                    adresse_2: 'Bâtiment A',
                    adresse_3: 'Étage 1',
                    code_postal: '97420',
                    nom_commune: 'Le Port',
                    identifiant_de_l_etablissement: '9740008R'
                }
            };

            // D'abord, mettre à jour l'implantation avec les nouveaux champs d'adresse
            chai.request(server)
                .put(`/test/implantations/${implantationId}`)
                .send(updatedAddressData)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    const updatedImplantation = res.body.data;

                    // Vérifier que les champs d'adresse sont correctement mis à jour
                    expect(updatedImplantation.ecole.adresse_1).to.equal(updatedAddressData.ecole.adresse_1);
                    expect(updatedImplantation.ecole.adresse_2).to.equal(updatedAddressData.ecole.adresse_2);
                    expect(updatedImplantation.ecole.adresse_3).to.equal(updatedAddressData.ecole.adresse_3);

                    // Maintenant, mettre à jour à nouveau avec des valeurs différentes
                    const newAddressData = {
                        ...updatedAddressData,
                        ecole: {
                            ...updatedAddressData.ecole,
                            adresse_1: '789 rue de l\'école',
                            adresse_2: 'Bâtiment Z',
                            adresse_3: 'Étage 10'
                        }
                    };

                    chai.request(server)
                        .put(`/test/implantations/${implantationId}`)
                        .send(newAddressData)
                        .end((err, res) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            res.should.have.status(200);
                            expect(res.body).to.have.all.keys('ret', 'data');
                            const finalImplantation = res.body.data;

                            // Vérifier que les champs d'adresse sont correctement mis à jour à nouveau
                            expect(finalImplantation.ecole.adresse_1).to.equal(newAddressData.ecole.adresse_1);
                            expect(finalImplantation.ecole.adresse_2).to.equal(newAddressData.ecole.adresse_2);
                            expect(finalImplantation.ecole.adresse_3).to.equal(newAddressData.ecole.adresse_3);

                            done();
                        });
                });
        });

        it('it should return 404 when updating a non-existent implantation', (done) => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updatedData = {
                nom: 'Site du Port Modifié',
                alias: 'PORT-MOD',
                adresse: '456 rue du Port, 97420 Le Port',
                remarque: 'Nouvelle remarque',
                ecole: {
                    nom_etablissement: 'Ecole élémentaire publique Raoul Fruteau',
                    adresse_1: '456 rue de l\'école',
                    adresse_2: 'Bâtiment E',
                    adresse_3: 'Étage 5',
                    code_postal: '97420',
                    nom_commune: 'Le Port',
                    identifiant_de_l_etablissement: '9740008R'
                }
            };

            chai.request(server)
                .put(`/test/implantations/${nonExistentId}`)
                .send(updatedData)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(520);
                    expect(res.body).to.have.all.keys('ret', 'err', 'info', 'date');
                    expect(res.body.ret).to.equal(-1);
                    expect(res.body.err).to.equal('Implantation non trouvée');
                    expect(res.body.info).to.equal('categorie-controller.js:updateImplantation');
                    done();
                });
        });

        it('it should return 400 when missing required fields', (done) => {
            const invalidData = {
                nom: 'Site du Port Modifié',
                // Missing required ecole field
                alias: 'PORT-MOD',
                adresse: '456 rue du Port, 97420 Le Port',
                remarque: 'Nouvelle remarque'
            };

            chai.request(server)
                .put(`/test/implantations/${implantationId}`)
                .send(invalidData)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    res.should.have.status(520);
                    expect(res.body).to.have.all.keys('ret', 'err', 'info', 'date');
                    expect(res.body.ret).to.equal(-1);
                    expect(res.body.err).to.equal('Champs obligatoires manquants');
                    expect(res.body.info).to.equal('categorie-controller.js:updateImplantation');
                    done();
                });
        });
    });
});
