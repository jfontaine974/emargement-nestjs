process.env.NODE_ENV = 'test';
var mongoose = require('mongoose');
const { connectToDatabase } = require('./utils/db-connection');

// Utils clone function
const utils = {
    getCopy: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

//Require the dev-dependencies
let chai = require('chai');
var expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../index');
const Enfant = require('../api/models/enfant-model');
const EnfantCategorie = require('../api/models/enfant-categorie-model');
const UserCategorie = require('../api/models/user-categorie-model');
const User = require('../api/models/user-model');
const Categorie = require('../api/models/categorie-model');
const Implantation = require('../api/models/implantation-model');
const Periode = require('../api/models/periode-model');
const TypeActivite = require('../api/models/type-activite-model');
const TypeAccueil = require('../api/models/type-accueil-model');
const TrancheAge = require('../api/models/tranche-age-model');
let should = chai.should();
const newCate = {
    debutArrivee: 'hh:mm',
    debutDepart: 'hh:mm',
    debutJournee: 'hh:mm',
    finArrivee: 'hh:mm',
    finDepart: 'hh:mm',
    finJournee: 'hh:mm',
    isArrivee: false,
    isDepart: false,
    isJournee: false,
    'isTaux': false,
    'taux': 0,
    'tranche': 60,
    'isDeleted': false,
    nom: 'cate_test',
    parent_id: '0',
    life_cycle: 0,
    updatedAt: '2021-08-17T23:53:51.418Z',
    type_accueil_id: '60a6d2c4f2a7c1001fcf1502',
    tranche_age_id: '60a3b2c5f5e8d22e4b1f1c03'
};

const updateCate = {
    debutArrivee: 'hh:mm',
    debutDepart: 'hh:mm',
    debutJournee: 'hh:mm',
    finArrivee: 'hh:mm',
    finDepart: 'hh:mm',
    finJournee: 'blabla',
    isArrivee: false,
    isDepart: false,
    isJournee: false,
    'isTaux': false,
    'taux': 0,
    'tranche': 60,
    'isDeleted': false,
    nom: 'cate1',
    parent_id: '0',
    life_cycle: 0,
    type_accueil_id: '60a6d2c4f2a7c1001fcf1502',
    tranche_age_id: '60a3b2c5f5e8d22e4b1f1c03',
    implantation_id: '61c5e209a4c2444074340001',
    periode_id: '60a6d2c4f2a7c1001fcf1a03',
    type_activite_id: '60a6d2c4f2a7c1001fcf2a01',
    updatedAt: '2021-08-17T23:53:51.418Z'
};


var links = [
    {
        nom: 'cate2',
        parent_nom: 'cate1'
    },
    {
        nom: 'cate5',
        parent_nom: 'cate1'
    },
    {
        nom: 'cate6',
        parent_nom: 'cate1'
    },
    {
        nom: 'cate3',
        parent_nom: 'cate6'
    },
    {
        nom: 'cate7',
        parent_nom: 'cate6'
    }
];


var cleanAll = (done) => {
    try {
        Enfant.collection.drop();
        Categorie.collection.drop();
        EnfantCategorie.collection.drop();
        UserCategorie.collection.drop();
        User.collection.drop();
        Implantation.collection.drop();
        TypeActivite.collection.drop();
        TypeAccueil.collection.drop();
        TrancheAge.collection.drop();
        Periode.collection.drop();
    } catch (error) {

    } finally {

        done();
    }
};

var loadAll = async (done) => {
    console.log('Loading data');
    try {
        await Promise.all([
            Enfant.collection.drop({ ifExists: true }),
            Categorie.collection.drop({ ifExists: true }),
            EnfantCategorie.collection.drop({ ifExists: true }),
            UserCategorie.collection.drop({ ifExists: true }),
            User.collection.drop({ ifExists: true }),
            Implantation.collection.drop({ ifExists: true }),
            TypeActivite.collection.drop({ ifExists: true }),
            TypeAccueil.collection.drop({ ifExists: true }),
            TrancheAge.collection.drop({ ifExists: true }),
            Periode.collection.drop({ ifExists: true })

        ]);
    } finally {
        try {
            await Enfant.insertMany(require('./data/enfant.json'));
            await Categorie.insertMany(require('./data/categorie.json'));
            await EnfantCategorie.insertMany(require('./data/enfant-categorie.json'));
            await UserCategorie.insertMany(require('./data/user-categorie.json'));
            await User.insertMany(require('./data/user.json'));
            await Implantation.insertMany(require('./data/implantation.json'));
            await TypeActivite.insertMany(require('./data/type-activite.json'));
            await TypeAccueil.insertMany(require('./data/type-accueil.json'));
            await TrancheAge.insertMany(require('./data/tranche-age.json'));
            await Periode.insertMany(require('./data/periode.json'));

            console.log('All data loaded');
            done();
        } catch (error) {
            console.log('KOOO INSERT');
            console.log(error);
            done();
        }

    }

};


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms * 1000);
    });
}

chai.use(chaiHttp);

var tests = [

    {
        type: 'POST',
        route: '/test/categories/list',
        desc: 'Doit retourner toutes les categories',
        fn: (done) => {
            chai.request(server)
                .post('/test/categories/list')
                .end((err, res) => {
                    if (err)
                        done(err);
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    var r = res.body.data;
                    // r.forEach(e => delete e._id)
                    var exCate = utils.getCopy(require('./data/categorie.json')).filter(c => c.life_cycle < 9);
                    var catsUser = require('./data/user-categorie.json').filter(u => u.life_cycle < 9);
                    var catsChild = require('./data/enfant-categorie.json').filter(u => u.life_cycle < 9);
                    var inactiveChild = require('./data/enfant.json').filter(u => u.life_cycle === 9);
                    console.log(inactiveChild);
                    var ex = [];
                    exCate.forEach(u => {
                        var usersId = catsUser.filter(c => c.id_categorie == u._id && c.life_cycle < 9).map(e => e.id_user);
                        var childsId = catsChild.filter(c => c.id_categorie == u._id && c.life_cycle < 9).map(e => e.id_enfant);
                        var childsIdActive = childsId.filter(e => !inactiveChild.map(e => e._id).includes(e));
                        delete u.password;
                        ex.push({
                            categorie: u,
                            users_id: usersId,
                            childs_id: childsIdActive
                        });
                    });

                    expect(r).to.deep.equals(ex);
                    done();
                });
        }
    }

];
//Our parent block
describe('========== TEST CATEGORIE ==========', () => {

    before((done) => {
        if (process.env.NODE_ENV != 'test') {
            console.error('NODE_ENV!=test !');
            process.exit(1);
        }

        // Si nous utilisons déjà une base de données en mémoire, ne pas tenter de se connecter à nouveau
        if (process.env.USE_MEMORY_DB === 'true' && mongoose.connection.readyState === 1) {
            console.log('Utilisation de la connexion en mémoire existante.');
            return loadAll(done);
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

    const testsToRun = [];
    testsToRun.push(1);
    testsToRun.push(2);
    testsToRun.push(3);
    testsToRun.push(4);
    testsToRun.push(5);
    testsToRun.push(6);
    testsToRun.push(7);
    testsToRun.push(8);
    testsToRun.push(9);
    testsToRun.push(10);
    testsToRun.push(11);
    testsToRun.push(12);
    testsToRun.push(13);

    if (testsToRun.includes(1)) {
        describe('Liste des catégories - GET all', () => {
            it('it should GET all categorie !!', (done) => {
                chai.request(server)
                    .post('/test/categories/list')
                    .end((err, res) => {
                        if (err)
                            done(err);
                        res.should.have.status(200);
                        expect(res.body).to.have.all.keys('ret', 'data');
                        var r = res.body.data;

                        r.sort((a, b) => a.categorie._id.localeCompare(b.categorie._id));

                        // r.forEach(e => delete e._id)
                        var exCate = utils.getCopy(require('./data/categorie.json')).filter(c => c.life_cycle < 10);
                        var catsUser = require('./data/user-categorie.json').filter(u => u.life_cycle < 9);
                        var catsChild = require('./data/enfant-categorie.json').filter(u => u.life_cycle < 9);
                        // const implantationData = require('./data/implantation.json');
                        var inactiveChild = require('./data/enfant.json').filter(u => u.life_cycle === 9);



                        var ex = [];

                        exCate.forEach(u => {
                            var usersId = catsUser.filter(c => c.id_categorie == u._id).map(e => e.id_user);
                            var childsId = catsChild.filter(c => c.id_categorie == u._id).map(e => e.id_enfant);
                            var childsIdActive = childsId.filter(e => !inactiveChild.map(e => e._id).includes(e));
                            // const implantation = implantationData.find(i => i._id === u.implantation_id)??null

                            // console.log(implantation);
                            delete u.password;

                            // u.implantation = implantation;
                            ex.push({
                                categorie: u,
                                users_id: usersId,
                                childs_id: childsIdActive
                            });
                        });

                        ex.sort((a, b) => a.categorie._id.localeCompare(b.categorie._id));

                        expect(r).to.deep.equals(ex);
                        done();
                    });
            });
        });
    }

    if (testsToRun.includes(2)) {
        describe('Création de catégorie - PUT /categories', () => {
            it('it should create a categorie!!', (done) => {

                chai.request(server)
                    .put('/test/categories/')
                    .send(newCate)
                    .end((err, res) => {
                        console.log(err);
                        res.should.have.status(200);
                        expect(res.body).to.have.all.keys('ret', 'data');
                        var r = res.body.data;
                        var ex = newCate;
                        ex.life_cycle = 0;
                        delete r.categorie._id;
                        delete r.categorie.createdAt;
                        delete r.categorie.updatedAt;
                        delete ex._id;
                        delete ex.updatedAt;
                        expect(r).to.deep.equals({
                            categorie: ex,
                            childs_id: [],
                            users_id: []
                        });
                        chai.request(server)
                            .post('/test/categories/list')
                            .end((err, res) => {
                                if (err) done(err);
                                res.should.have.status(200);
                                expect(res.body).to.have.all.keys('ret', 'data');
                                var r = res.body.data.map(e => e.categorie);

                                const normalizeObject = (obj) => {
                                    const normalized = { ...obj };
                                    delete normalized._id;
                                    delete normalized.createdAt;
                                    delete normalized.updatedAt;
                                    return normalized;
                                };

                                r = r.map(normalizeObject);

                                var exCate = utils.getCopy(require('./data/categorie.json'))
                                    .filter(c => c.life_cycle < 10)
                                    .map(normalizeObject);


                                var ex = [normalizeObject(newCate), ...exCate];

                                // Trier les tableaux par nom pour une comparaison cohérente
                                r.sort((a, b) => a.nom.localeCompare(b.nom));
                                ex.sort((a, b) => a.nom.localeCompare(b.nom));

                                expect(r).to.deep.equal(ex);
                                done();

                            });
                        // done();
                    });
            });
        });
    }

    if (testsToRun.includes(3)) {
        describe('Liaison parent-enfant - PUT /categories/linkparent', () => {

            var cateJson = utils.getCopy(require('./data/categorie.json'));

            var data = links.map(e => {
                return {
                    id: cateJson.filter(c => c.nom == e.nom)[0]._id,
                    parent_id: cateJson.filter(c => c.nom == e.parent_nom)[0]._id
                };
            });


            it('it should update parent_id categorie!!', (done) => {
                chai.request(server)
                    .put('/test/categories/linkparent')
                    .send({ list: data })
                    .end((err, res) => {

                        res.should.have.status(200);
                        var dataRes = res.body.data;
                        expect(dataRes.length).to.equal(links.length);
                        chai.request(server)
                            .post('/test/categories/list')
                            .end((err, res) => {
                                res.should.have.status(200);
                                expect(res.body).to.have.all.keys('ret', 'data');
                                var r = res.body.data.map(e => e.categorie);

                                data.forEach(d => {
                                    expect(r.filter(c => c._id == d.id)[0].parent_id).to.equal(d.parent_id);
                                });
                                done();
                            });
                    });

            });
        });
    }

    if (testsToRun.includes(4)) {

        describe('Désactivation de catégorie - PATCH /categories/:id/disable', () => {
            var _id = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate6')[0]._id;
            var _id3 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate3')[0]._id;
            var _id7 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate7')[0]._id;
            const nbCats = utils.getCopy(require('./data/categorie.json')).length;

            it('it should disable a categorie!!', (done) => {
                Categorie.findById(_id)
                    .then(u => {
                        expect(u.life_cycle).to.equal(0);
                        chai.request(server)
                            .patch('/test/categories/' + u._id + '/disable')
                            .end((err, res) => {
                                res.should.have.status(200);
                                chai.request(server)
                                    .post('/test/categories/list')
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        expect(res.body).to.have.all.keys('ret', 'data');
                                        var r = res.body.data.map(e => e.categorie);
                                        // expect(r.length).to.equal(nbCats);
                                        var ex = r.filter(e => e._id == _id);
                                        expect(ex[0]._id).to.equals(u._id + '');
                                        expect(ex[0].life_cycle).to.equals(9);
                                        var ex = r.filter(e => e._id == _id3);
                                        expect(ex[0]._id).to.equals(_id3 + '');
                                        expect(ex[0].life_cycle).to.equals(9);
                                        var ex = r.filter(e => e._id == _id7);
                                        expect(ex[0]._id).to.equals(_id7 + '');
                                        expect(ex[0].life_cycle).to.equals(9);
                                        done();
                                    });
                            });
                    });
            });
        });
    }

    if (testsToRun.includes(5)) {

        describe('Réactivation de catégorie - PATCH /categories/:id/enable', () => {
            var _id = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate6')[0]._id;
            var _id3 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate3')[0]._id;
            var _id7 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate7')[0]._id;
            it('it should enable a categorie!!', (done) => {
                Categorie.findById(_id)
                    .then(u => {
                        expect(u.life_cycle).to.equal(9);
                        chai.request(server)
                            .patch('/test/categories/' + u._id + '/enable')
                            .end((err, res) => {
                                res.should.have.status(200);
                                chai.request(server)
                                    .post('/test/categories/list')
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        expect(res.body).to.have.all.keys('ret', 'data');
                                        var r = res.body.data.map(e => e.categorie);
                                        var ex = r.filter(e => e._id == _id);
                                        expect(ex.length).to.equal(1);
                                        ex = r.filter(e => e._id == _id3);
                                        expect(ex.length).to.equal(1);
                                        ex = r.filter(e => e._id == _id7);
                                        expect(ex.length).to.equal(1);
                                        done();
                                    });
                            });
                    });
            });
        });
    }

    if (testsToRun.includes(6)) {

        describe('Mise à jour de catégorie - PUT /categories/:id', () => {
            var _id = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate1')[0]._id;

            it('it should update a categorie!!', (done) => {
                Categorie.findById(_id)
                    .then(u => {
                        chai.request(server)
                            .put('/test/categories/' + u._id)
                            .send(updateCate)
                            .end((err, res) => {
                                if (err) done(err);
                                res.should.have.status(200);
                                delete res.body.data.categorie.updatedAt;
                                delete res.body.data.categorie._id;
                                var exCate = utils.getCopy(require('./data/categorie.json')).filter(c => c.life_cycle < 9);
                                var catsUser = require('./data/user-categorie.json').filter(u => u.life_cycle < 9);
                                var catsChild = require('./data/enfant-categorie.json').filter(u => u.life_cycle < 9);
                                var usersId = catsUser.filter(c => c.id_categorie == _id && c.life_cycle < 9).map(e => e.id_user);
                                var childsId = catsChild.filter(c => c.id_categorie == _id && c.life_cycle < 9).map(e => e.id_enfant);
                                var inactiveChild = require('./data/enfant.json').filter(u => u.life_cycle === 9);
                                var childsIdActive = childsId.filter(e => !inactiveChild.map(e => e._id).includes(e));
                                delete updateCate.updatedAt;
                                var ex = {
                                    categorie: updateCate,
                                    childs_id: childsIdActive,
                                    users_id: usersId
                                };
                                expect(ex).to.deep.equals(res.body.data);
                                chai.request(server)
                                    .post('/test/categories/list')
                                    .end((err, res) => {
                                        if (err) done(err);
                                        res.should.have.status(200);
                                        expect(res.body).to.have.all.keys('ret', 'data');
                                        var r = res.body.data.map(e => e.categorie);
                                        var data1 = r.filter(e => e._id == _id)[0];
                                        delete data1._id;
                                        delete data1.updatedAt;
                                        expect(data1).to.deep.equal(updateCate);
                                        done();

                                    });

                            });
                    });

            });
        });
    }

    if (testsToRun.includes(7)) {

        describe('Mise à jour multiple de catégories - PUT /categories/updatelist', () => {
            var data_id1 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate1')[0];
            var data_id8 = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate8')[0];

            data_id1 = {
                ...data_id1,
                implantation_id: '61c5e209a4c2444074340001',
                periode_id: '60a6d2c4f2a7c1001fcf1a03',
                tranche_age_id: '60a3b2c5f5e8d22e4b1f1c03',
                type_accueil_id: '60a6d2c4f2a7c1001fcf1502',
                type_activite_id: '60a6d2c4f2a7c1001fcf2a01'
            };

            data_id1.debutArrivee = 'blba';
            data_id8.debutJournee = 'qsfs';
            var dataToSend = [data_id1, data_id8];
            it('it should update a categorie!!', (done) => {

                chai.request(server)
                    .put('/test/categories/updatelist')
                    .send(dataToSend)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        chai.request(server)
                            .post('/test/categories/list')
                            .end((err, res) => {
                                var exCate = utils.getCopy(require('./data/categorie.json')).filter(c => c.life_cycle < 9);
                                var catsUser = require('./data/user-categorie.json').filter(u => u.life_cycle < 9);
                                var catsChild = require('./data/enfant-categorie.json').filter(u => u.life_cycle < 9);
                                var r = res.body.data;
                                var ex = [];
                                r.forEach(e => {
                                    delete e.categorie.updatedAt;
                                });
                                exCate.forEach(u => {
                                    var usersId = catsUser.filter(c => c.id_categorie == u._id && c.life_cycle < 9).map(e => e.id_user);
                                    var childsId = catsChild.filter(c => c.id_categorie == u._id && c.life_cycle < 9).map(e => e.id_enfant);
                                    delete u.password;
                                    if (u._id == data_id1._id) {
                                        u = data_id1;
                                    }
                                    if (u._id == data_id8._id) {
                                        u = data_id8;
                                    }

                                    delete u.updatedAt;

                                    ex.push({
                                        categorie: u,
                                        users_id: usersId,
                                        childs_id: childsId
                                    });
                                });

                                expect(r.map(f => f.categorie).filter(e => e._id == data_id1._id)[0]).to.deep.equals(ex.map(f => f.categorie).filter(e => e._id == data_id1._id)[0]);
                                expect(r.map(f => f.categorie).filter(e => e._id == data_id8._id)[0]).to.deep.equals(ex.map(f => f.categorie).filter(e => e._id == data_id8._id)[0]);
                                done();
                            });

                    });


            });
        });
    }

    if (testsToRun.includes(8)) {

        describe('Duplication de catégorie - PUT /categories/:id/duplicate', () => {
            var _id = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate1')[0]._id;

            var linksAfter = links.map(e => {

                return {
                    nom: e.nom,
                    parent_nom: e.parent_nom.replace('cate1', 'cate1_copie')
                };
            });

            var linksExpected = links.concat(linksAfter);

            var getNom = (data, id) => {
                return data.filter(e => e._id == id)[0].nom;
            };

            it('it should duplicate a categorie!!', (done) => {

                chai.request(server)
                    .put('/test/categories/' + _id + '/duplicate')
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        var id = res.body.data.map(e => e.categorie).filter(c => c.nom == 'cate1_copie')[0]._id;

                        chai.request(server)
                            .post('/test/categories/list')
                            .end(async (err, res) => {
                                if (err) done(err);
                                var resRecup = [];
                                var cats = res.body.data.map(e => e.categorie);

                                cats.forEach(c => {

                                    if (c.parent_id && parseInt(c.parent_id) != 0) {

                                        var nom = c.nom;
                                        var parent_nom = getNom(cats, c.parent_id);
                                        // if(nom)
                                        resRecup.push({
                                            nom,
                                            parent_nom
                                        });
                                    }
                                });
                                expect(resRecup).to.have.deep.members(linksExpected);
                                await loadAll(done);
                            });

                    });


            });
        });
    }

    if (testsToRun.includes(9)) {

        describe('Mise à jour arborescente - PATCH /categories/:id/tree', () => {
            var _id = utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate6')[0]._id;


            var data = {
                data: {
                    debutDepart: 'blbl',
                    debutJournee: 'qsdsqd'
                },
                list_id: utils.getCopy(require('./data/categorie.json')).filter(e => e.nom == 'cate3' || e.nom == 'cate7').map(e => e._id)

            };

            var getNom = (data, id) => {
                return data.filter(e => e._id == id)[0].nom;
            };

            it('it should update a list of categorie / tree!', (done) => {

                chai.request(server)
                    .patch('/test/categories/' + _id + '/tree')
                    .send(data)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        chai.request(server)
                            .post('/test/categories/list')
                            .end((err, res) => {
                                if (err) done(err);
                                var resRecup = [];
                                var cats = res.body.data.map(e => e.categorie);
                                var exCate = utils.getCopy(require('./data/categorie.json')).filter(c => c.life_cycle < 10);
                                data.list_id.forEach(id => {
                                    c = exCate.filter(c => c._id == id)[0];
                                    c.debutDepart = data.data.debutDepart;
                                    c.debutJournee = data.data.debutJournee;
                                });

                                exCate.forEach(c => {
                                    delete c.parent_id;
                                    delete c.updatedAt;
                                    delete c.createdAt;
                                });
                                cats.forEach(c => {
                                    delete c.parent_id;
                                    delete c.updatedAt;
                                    delete c.createdAt;
                                });

                                console.log('=========');
                                console.log(exCate.length);
                                console.log(cats.length);
                                console.log('=========');

                                expect(cats).to.deep.equals(exCate);
                                done();
                            });

                    });


            });
        });
    }

    if (testsToRun.includes(10)) {

        describe('Liste des catégories par date - POST /test/categories/list/:date', () => {


            it('it should list categorie from date!', (done) => {
                var date = '2021-05-17T23:53:51.418Z';
                chai.request(server)
                    .post('/test/categories/list/' + date)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);

                        var exCate = utils.getCopy(require('./data/categorie.json')).filter(u => u.updatedAt > date);


                        expect(res.body.data.map(e => e.categorie).map(e => e.nom)).to.deep.equals(exCate.map(e => e.nom));
                        done();

                    });


            });
        });
    }

    if (testsToRun.includes(11)) {

        describe('11/ POST /test/categories/liaison/:date', () => {


            it('it should list links categorie-categorie from date!', (done) => {
                var date = '2021-05-17T23:53:51.418Z';
                chai.request(server)
                    .post('/test/categories/liaison/' + date)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);

                        var exCate = utils.getCopy(require('./data/categorie.json')).filter(u => u.updatedAt > date).filter(e => e.parent_id && e.parent_id != 0).map(e => {
                            return {
                                id_mere: e.parent_id,
                                id_fille: e._id,
                                updatedAt: e.updatedAt
                            };
                        });
                        expect(res.body.data).to.deep.equals(exCate);
                        done();

                    });


            });
        });
    }

    if (testsToRun.includes(12)) {
        describe('12/ PUT /categories - validation type_accueil_id', () => {
            it('devrait rejeter un type_accueil_id invalide', (done) => {
                const invalidCate = {
                    ...newCate,
                    type_accueil_id: 'invalid_id'
                };

                chai.request(server)
                    .put('/test/categories/')
                    .send(invalidCate)
                    .end((err, res) => {
                        res.should.have.status(520);
                        done();
                    });
            });

            it('devrait accepter un type_accueil_id valide', (done) => {
                const typeAccueilId = '60a6d2c4f2a7c1001fcf1501';
                const validCate = {
                    ...newCate,
                    type_accueil_id: typeAccueilId
                };

                chai.request(server)
                    .put('/test/categories/')
                    .send(validCate)
                    .end((err, res) => {
                        res.should.have.status(200);
                        expect(res.body.ret).to.equal(0);
                        expect(res.body.data.categorie.type_accueil_id).to.equal(typeAccueilId);
                        done();
                    });
            });

            it('devrait accepter une catégorie sans type_accueil_id (champ optionnel)', (done) => {
                const validCate = { ...newCate };
                delete validCate.type_accueil_id;

                chai.request(server)
                    .put('/test/categories/')
                    .send(validCate)
                    .end((err, res) => {
                        res.should.have.status(200);
                        expect(res.body.ret).to.equal(0);
                        expect(res.body.data.categorie.type_accueil_id).to.be.undefined;
                        done();
                    });
            });
        });
    }

    if (testsToRun.includes(13)) {
        describe('13/ PUT /categories - validation tranche_age_id', () => {
            it('devrait rejeter un tranche_age_id invalide', (done) => {
                const invalidCate = {
                    ...newCate,
                    tranche_age_id: 'invalid_id'
                };

                chai.request(server)
                    .put('/test/categories/')
                    .send(invalidCate)
                    .end((err, res) => {
                        res.should.have.status(520);
                        done();
                    });
            });

            it('devrait accepter un tranche_age_id valide', (done) => {
                const trancheAgeId = '60a3b2c5f5e8d22e4b1f1c03';
                const validCate = {
                    ...newCate,
                    tranche_age_id: trancheAgeId
                };

                chai.request(server)
                    .put('/test/categories/')
                    .send(validCate)
                    .end((err, res) => {
                        res.should.have.status(200);
                        expect(res.body.ret).to.equal(0);
                        expect(res.body.data.categorie.tranche_age_id).to.equal(trancheAgeId);
                        done();
                    });
            });

            it('devrait accepter une catégorie sans tranche_age_id (champ optionnel)', (done) => {
                const validCate = { ...newCate };
                delete validCate.tranche_age_id;

                chai.request(server)
                    .put('/test/categories/')
                    .send(validCate)
                    .end((err, res) => {
                        res.should.have.status(200);
                        expect(res.body.ret).to.equal(0);
                        expect(res.body.data.categorie.tranche_age_id).to.be.undefined;
                        done();
                    });
            });
        });
    }

});
