process.env.NODE_ENV = 'test';
var { mongoConf } = require('../config/conf');
var mongoose = require('mongoose');
var utils = require('../utils/index');
const { connectToDatabase } = require('./utils/db-connection');

//Require the dev-dependencies
let chai = require('chai');
var expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../index');
const TypeAccueil = require('../api/models/type-accueil-model');
let should = chai.should();

chai.use(chaiHttp);

describe('========== TEST TYPE ACCUEIL ==========', () => {
    before(async function () {
        this.timeout(30000); // Augmenter le timeout pour la connexion à la BD en mémoire

        if (process.env.NODE_ENV != 'test') {
            console.error('NODE_ENV!=test !');
            process.exit(1);
        }

        try {
            // Utiliser l'utilitaire de connexion à la base de données
            await connectToDatabase();

            // Charger les données de test si nécessaire
            // Si aucune donnée spécifique n'est nécessaire, on peut laisser cette partie vide
        } catch (error) {
            console.error("Erreur de connexion à la base de données :", error);
            throw error;
        }
    });

    beforeEach(async () => {
        // Nettoyer les données avant chaque test
        await TypeAccueil.deleteMany({});
    });

    after(async () => {
        try {
            // Nettoyer les données après tous les tests
            await TypeAccueil.collection.drop();
        } catch (error) {
            console.error("Erreur lors du nettoyage des données :", error);
        }
    });

    describe('POST /type-accueil', () => {
        it('devrait retourner une liste vide quand il n\'y a pas de types d\'accueil', (done) => {
            chai.request(server)
                .post('/test/type-accueil/list')
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    expect(res.body).to.have.all.keys('ret', 'data');
                    expect(res.body.ret).to.equal(0);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    done();
                });
        });

        it('devrait retourner la liste des types d\'accueil', (done) => {
            // Créer des types d'accueil de test
            const typesAccueil = [
                { nom: "Périscolaire", life_cycle: 0, code: "PERI" },
                { nom: "Extrascolaire", life_cycle: 0, code: "EXTRA" },
                { nom: "Autre", life_cycle: 0, code: "AUTRE" }
            ];

            TypeAccueil.insertMany(typesAccueil)
                .then(() => {
                    chai.request(server)
                        .post('/test/type-accueil/list')
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(200);
                            expect(res.body).to.have.all.keys('ret', 'data');
                            expect(res.body.ret).to.equal(0);
                            expect(res.body.data).to.be.an('array');
                            expect(res.body.data).to.have.lengthOf(3);

                            //expect keys hasTrancheAge on data
                            res.body.data.forEach(item => {
                                expect(item).to.have.property('hasTrancheAge');
                            });

                            // Vérifier que les données sont correctes
                            const noms = res.body.data.map(type => type.nom).sort();
                            expect(noms).to.deep.equal(['Autre', 'Extrascolaire', 'Périscolaire']);
                            done();
                        });
                })
                .catch(done);
        });

        it('devrait exclure les types d\'accueil supprimés (life_cycle = 9)', (done) => {
            // Créer des types d'accueil de test
            const typesAccueil = [
                { nom: "Périscolaire", life_cycle: 0, code: "PERI" },
                { nom: "Extrascolaire", life_cycle: 9, code: "EXTRA" },
                { nom: "Autre", life_cycle: 0, code: "AUTRE" }
            ];

            TypeAccueil.insertMany(typesAccueil)
                .then(() => {
                    chai.request(server)
                        .post('/test/type-accueil/list')
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(200);
                            expect(res.body).to.have.all.keys('ret', 'data');
                            expect(res.body.ret).to.equal(0);
                            expect(res.body.data).to.be.an('array');
                            expect(res.body.data).to.have.lengthOf(2);

                            // Vérifier que les données sont correctes
                            const noms = res.body.data.map(type => type.nom).sort();
                            expect(noms).to.deep.equal(['Autre', 'Périscolaire']);
                            done();
                        });
                })
                .catch(done);
        });
    });
});