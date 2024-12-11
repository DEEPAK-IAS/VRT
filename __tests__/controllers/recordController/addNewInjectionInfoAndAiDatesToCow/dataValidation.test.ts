import request from 'supertest';
import sqlite3 from '../../../../backend/src/db/sqlite3';
import { SQLITE3_DATABASE_DIR_PATH } from "../../../../backend/src/utils/constants";
import { app } from "../../../../backend/src/app";
import data from './data';


let adminAccessToken: string | null = null;

beforeAll(async () => {
  await sqlite3.connectAndCreateDatabase(SQLITE3_DATABASE_DIR_PATH, "database");

  const res = await request(app).post("/api/v1/admin/login").send({
    email: process.env.ADMIN_EMAIL,
    password: "<password>"
  });

  adminAccessToken = res.headers["set-cookie"];
});


describe("Record API Tests [ Add New Injection Info And Ai Dates To Cow ]", () => {
  test("Test 1 [ Task: Invalid user id ] [ Response: Bad Request 400 ]", async () => {
    const requestParamsToTest = ["a", null, undefined];
    for (let value of requestParamsToTest) {
      const res = await request(app).post(`/api/v1/records/${value}/cows/1/inject-info-ai-dates`).set("Cookie", adminAccessToken!);
      expect(res.statusCode).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.success).not.toBeTruthy();
      expect(res.body.message).toBe(`Bad Request: Invalid user id in URL. The id must be a number, but '${value}' provided.`);
    }
  });



  test("Test 2 [ Task: Invalid cow id ] [ Response: Bad Request 400 ]", async () => {
    const requestParamsToTest = ["a", null, undefined];
    for (let value of requestParamsToTest) {
      const res = await request(app).post(`/api/v1/records/1/cows/${value}/inject-info-ai-dates`).set("Cookie", adminAccessToken!);
      expect(res.statusCode).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.success).not.toBeTruthy();
      expect(res.body.message).toBe(`Bad Request: Invalid cow id in URL. The id must be a number, but '${value}' provided.`);
    }
  });



  test("Test 3 [ Task: Valid id but user record not exists ] [ Response: User record not found 404 ]", async () => {
    const res = await request(app).post(`/api/v1/records/100/cows/100/inject-info-ai-dates`).set("Cookie", adminAccessToken!);
    expect(res.statusCode).toBe(404);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.success).not.toBeTruthy();
    expect(res.body.message).toBe("User record not found for the specified user id: 100");
  });



  test("Test 4 [ Task: Valid id but cow record not exists ] [ Response: Cow record not found 404 ]", async () => {
    const res = await request(app).post(`/api/v1/records/1/cows/100/inject-info-ai-dates`).set("Cookie", adminAccessToken!);
    expect(res.statusCode).toBe(404);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.success).not.toBeTruthy();
    expect(res.body.message).toBe("Cow record not found for the specified cow id: 100");
  });


  test("Test 5 [ Task: Invalid injection info and ai dates data ] [ Response: Bad Request 400 ]", async () => {
    for (let injectionInfoAndAiDatesDataToTest of data.injectionInfoAndAiDataToTest) {
      const res = await request(app).post(`/api/v1/records/1/cows/3/inject-info-ai-dates`)
        .send(injectionInfoAndAiDatesDataToTest.data)
        .set("Cookie", adminAccessToken!);
      expect(res.statusCode).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.success).not.toBeTruthy();
      expect(res.body.message).toBe(injectionInfoAndAiDatesDataToTest.message);  
    }
  });
});