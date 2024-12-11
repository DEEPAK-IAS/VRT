import request from 'supertest';
import sqlite3 from '../../../backend/src/db/sqlite3';
import { SQLITE3_DATABASE_DIR_PATH } from "../../../backend/src/utils/constants";
import { app } from "../../../backend/src/app";


let adminAccessToken: string | null = null;

beforeAll(async () => {
  await sqlite3.connectAndCreateDatabase(SQLITE3_DATABASE_DIR_PATH, "database");

  const res = await request(app).post("/api/v1/admin/login").send({
    email: process.env.ADMIN_EMAIL,
    password: "<password>"
  });

  adminAccessToken = res.headers["set-cookie"];
});



describe("Record API Tests [ Delete Record By User Id ]", () => {
  test("Test 1 [ Delete record with invalid id ] [ Response: Bad Request 400 ]", async () => {
    const requestParamsToTest = ["a", null, undefined];
    for (let value of requestParamsToTest) {
      const res = await request(app).delete(`/api/v1/records/${value}`).set("Cookie", adminAccessToken!);
      expect(res.statusCode).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.success).not.toBeTruthy();
      expect(res.body.message).toBe(`Bad Request: Invalid user id in URL. The id must be a number, but '${value}' provided.`);
    }
  }); 



  test("Test 2 [ Delete with valid id but record not exists ] [ Response: Record Not Found 404 ]", async () => {
    const res = await request(app).delete(`/api/v1/records/100`).set("Cookie", adminAccessToken!);
    expect(res.statusCode).toBe(404);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.success).not.toBeTruthy();
    expect(res.body.message).toBe("Record not found for the specified user id: 100");
  });



  test("Test 3 [ Delete with valid id but record exists ] [ Response: Record Not Found 404 ]", async () => {
    const res = await request(app).delete(`/api/v1/records/17`).set("Cookie", adminAccessToken!);
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });
});


