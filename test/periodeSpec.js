process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const should = chai.should();
const app = require('../index');
const Periode = require('../api/models/periode-model');
const TypeAccueil = require('../api/models/type-accueil-model');
const { connectToDatabase } = require('./utils/db-connection');

chai.use(chaiHttp);

describe('Periode', function () {
    this.timeout(30000);
    let typeAccueilId;

    before(async function () {
        if (process.env.NODE_ENV != 'test') {
            console.error('NODE_ENV!=test !');
            process.exit(1);
        }
        await connectToDatabase();

        await TypeAccueil.deleteMany({});
        const typeAccueil = await TypeAccueil.create({
            nom: 'Type Accueil Test',
            code: 'TAT'
        });
        typeAccueilId = typeAccueil._id;
    });

    beforeEach(async function () {
        try {
            await Periode.deleteMany({});
        } catch (error) {
            console.error('Error cleaning database:', error);
        }
    });

    describe('GET /test/periode', () => {
        it('should return all active periodes', async function () {
            await Periode.create({
                nom: 'Periode 1',
                code: 'PER1',
                type: 'HEBDOMADAIRE',
                ordre: 1,
                type_accueil_id: typeAccueilId,
                life_cycle: 0
            });

            await Periode.create({
                nom: 'Periode 2',
                code: 'PER2',
                type: 'VACANCES',
                ordre: 2,
                type_accueil_id: typeAccueilId,
                life_cycle: 0
            });

            await Periode.create({
                nom: 'Periode 3',
                code: 'PER3',
                type: 'AUTRE',
                ordre: 3,
                type_accueil_id: typeAccueilId,
                life_cycle: 9 // Cette periode ne doit pas etre retournee
            });

            const res = await chai.request(app)
                .post('/test/periode/list');

            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('ret').eql(0);
            res.body.should.have.property('data');
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(2);
        });
    });

    describe('Modele Periode', () => {
        it('should require nom', async function () {
            try {
                await Periode.create({
                    code: 'PER4',
                    type: 'HEBDOMADAIRE',
                    type_accueil_id: typeAccueilId
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors.nom).to.exist;
            }
        });

        it('should require code', async function () {
            try {
                await Periode.create({
                    nom: 'Periode 4',
                    type: 'HEBDOMADAIRE',
                    type_accueil_id: typeAccueilId
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors.code).to.exist;
            }
        });

        it('should require type', async function () {
            try {
                await Periode.create({
                    nom: 'Periode 4',
                    code: 'PER4',
                    type_accueil_id: typeAccueilId
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors.type).to.exist;
            }
        });

        it('should require type_accueil_id', async function () {
            try {
                await Periode.create({
                    nom: 'Periode 4',
                    code: 'PER4',
                    type: 'HEBDOMADAIRE'
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors.type_accueil_id).to.exist;
            }
        });

        it('should enforce enum values for type', async function () {
            try {
                await Periode.create({
                    nom: 'Periode 4',
                    code: 'PER4',
                    type: 'INVALID_TYPE',
                    type_accueil_id: typeAccueilId
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors.type).to.exist;
            }
        });

        it('should enforce unique code', async function () {
            await Periode.create({
                nom: 'Periode Unique',
                code: 'PER_UNIQUE',
                type: 'HEBDOMADAIRE',
                type_accueil_id: typeAccueilId
            });

            try {
                await Periode.create({
                    nom: 'Autre Periode',
                    code: 'PER_UNIQUE', // Code duplique
                    type: 'VACANCES',
                    type_accueil_id: typeAccueilId
                });
                expect.fail('Should have thrown a duplicate key error');
            } catch (error) {
                expect(error).to.exist;
            }
        });
    });
});
