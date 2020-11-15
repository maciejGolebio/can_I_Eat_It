import {expect} from 'chai';
import { response } from 'express';
import {agent as request} from 'supertest';
import app from '../server'

describe("ALLERGENS", ()=>{
    it("GET ALL", ()=>{
        request(app).get('/allergens/all').then(
        (response)=> expect(response.status).to.equal(200)
        )
    })
    it("ADD ALLERGEN", ()=>{
        request(app).post('').then()
    })
})