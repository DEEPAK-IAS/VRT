import sqlite3 from "../db/sqlite3";
import queries from "../db/sqlite3/queries";
import { 
  NewCow, 
  Cow, 
  CowInDB, 
  InjectionInfoAndAiDate,
  InjectionInfoAndAiDateInDB,
  CowDataToUpdate,
  InjectionInfoAndAiDateDataToUpdate,
  UpdatedCow
} from "../utils/types";



function validateId(id: number, name: "Cow" | "User" | "Injection info and ai dates"): Error | void {
  if (id < 0) {
    throw new Error(`${name} id must be positive number.`);
  }

  if (!id) {
    throw new Error(`${name} id is null or undefined.`)
  }
}



function validateAmount(amount: any, name: "Price" | "Given amount" | "Pending Amount"): Error | void {
  if (typeof amount !== "number") {
    throw new Error(`${name} must be a valid number.`);
  }
}


function validateDate(date: string): Error | void {
  const dateRegexPattern = /^(0[1-9]|[12][0-9]|3[01])(\/|-)(0[1-9]|1[0-2])(\/|-)(19|20)\d{2}$/;
  if (!dateRegexPattern.test(date)) {
    throw new Error("Invalid Date Format. Supported format [DD/MM/YYYY or DD-MM-YYYY]");
  }
}



async function addNewCow(newCow: NewCow): Promise<Cow> {
  await sqlite3.insert(queries.INSERT_COW_RECORD_SQL, newCow.userId, newCow.name, newCow.breed, newCow.bullName);
  const createdCow = await sqlite3.select(queries.SELECT_LAST_COW_RECORD_SQL, false) as CowInDB;
  let newInjectionInfoAndAiDates = await addNewInjectionInfoAndAiDatesToCow(createdCow.id, newCow.injectionInfoAndAiDates) as InjectionInfoAndAiDate[];

  return {
    id: createdCow.id,
    name: createdCow.name,
    breed: createdCow.breed,
    bullName: createdCow.bull_name,
    injectionInfoAndAiDates:  newInjectionInfoAndAiDates,
    createdAt: createdCow.date_and_time
  };
}



async function addNewInjectionInfoAndAiDatesToCow(cowId: number, injectionInfoAndAiDates: InjectionInfoAndAiDate[]): Promise<InjectionInfoAndAiDate[]> {
  validateId(cowId, "Cow");

  for (let { name, price, givenAmount, pendingAmount, date } of injectionInfoAndAiDates) {
    validateAmount(price, "Price");
    validateAmount(givenAmount, "Given amount");
    validateAmount(pendingAmount, "Pending Amount");
    validateDate(date);
    await sqlite3.insert(queries.INSERT_INJECTION_INFO_AND_AI_DATES_RECORD_SQL, cowId, name, price, givenAmount, pendingAmount, date);
  }
  return await getInjectionInfoAndAiDatesByCowId(cowId);
}




async function getInjectionInfoAndAiDatesByCowId(cowId: number): Promise<InjectionInfoAndAiDate[]> {
  validateId(cowId, "Cow");
  const injectionInfoAndAiDatesInDB =  await sqlite3.select(queries.SELECT_INJECTION_INFO_AND_AI_DATES_RECORDS_BY_COW_ID_SQL, true, cowId) as InjectionInfoAndAiDateInDB[];
  const injectionInfoAndAiDates = injectionInfoAndAiDatesInDB.map(({id, name, price, given_amount, pending_amount, date}) => {
    return {
      id: id,
      name: name,
      price: price,
      givenAmount: given_amount,
      pendingAmount: pending_amount,
      date: date
    }
  }) as InjectionInfoAndAiDate[];
  return injectionInfoAndAiDates;
}



async function getInjectionInfoAndAiDateById(id: number): Promise<InjectionInfoAndAiDate | null> {
  validateId(id, "Injection info and ai dates");
  const injectionInfoAndAiDateInDB =  await sqlite3.select(queries.SELECT_INJECTION_INFO_AND_AI_DATES_RECORDS_BY_ID_SQL, false, id) as InjectionInfoAndAiDateInDB;
  if (!injectionInfoAndAiDateInDB) {
    return null;
  }
  return {
    id: injectionInfoAndAiDateInDB.id,
    name: injectionInfoAndAiDateInDB.name,
    price: injectionInfoAndAiDateInDB.price,
    givenAmount: injectionInfoAndAiDateInDB.given_amount,
    pendingAmount: injectionInfoAndAiDateInDB.pending_amount,
    date: injectionInfoAndAiDateInDB.date
  }
}



async function updateInjectionInfoAndAiDateById(id: number, injectInfoAndAiDate: InjectionInfoAndAiDateDataToUpdate ): Promise<InjectionInfoAndAiDate> {
  validateId(id, "Injection info and ai dates");
  for (let [key, value] of Object.entries(injectInfoAndAiDate)) {
    if (key === "price") {
      validateAmount(value, "Price");
    } else if (key === "givenAmount") {
      validateAmount(value, "Given amount");
    } else if (key === "pendingAmount") {
      validateAmount(value, "Pending Amount");
    } else if (key === "date") {
      validateDate(value);
    }

    key = key === "givenAmount" ? "given_amount" : key === "pendingAmount" ? "pending_amount" : key;
    const sql = queries.UPDATE_INJECTION_INFO_AND_AI_DATES_RECORDS_BY_ID_SQL.replace("<column_name>", key);
    await sqlite3.update(sql, value, id);
  }
  return await getInjectionInfoAndAiDateById(id) as InjectionInfoAndAiDate;
}



async function deleteInjectionInfoAndAiDatesByCowId(cowId: number): Promise<void> {
  validateId(cowId, "Cow");
  await sqlite3.delete(queries.DELETE_INJECTION_INFO_AND_AI_DATES_RECORDS_BY_COW_ID_SQL, cowId);
}



async function deleteInjectionInfoAndAiDateById(id: number) {
  validateId(id, "Injection info and ai dates");
  await sqlite3.delete(queries.DELETE_INJECTION_INFO_AND_AI_DATES_RECORDS_BY_ID_SQL, id);
}



async function getAllCows(): Promise<Cow[]> {
  let cows = await sqlite3.select(queries.SELECT_ALL_COWS_RECORDS_SQL, true) as CowInDB[];
  const injectionInfoAndAiDates = await sqlite3.select(queries.SELECT_ALL_INJECTION_INFO_AND_AI_DATES_RECORDS_WITH_COW_ID_SQL, true) as InjectionInfoAndAiDateInDB[];

  const cowsRecords: Cow[] = [];
  for (let cow of cows) {
    const cowInjectionInfoAndAiDates: InjectionInfoAndAiDate[] = injectionInfoAndAiDates
      .filter(({cow_id}) => cow_id === cow.id)
      .map(({id, name, price, given_amount, pending_amount, date}) => {
          return {
            id: id,
            name: name,
            price: price,
            givenAmount: given_amount,
            pendingAmount: pending_amount,
            date: date
          };
      });

    cowsRecords.push({
      id: cow.id,
      userId: cow.user_id,
      name: cow.name,
      breed: cow.breed,
      bullName: cow.bull_name,
      injectionInfoAndAiDates: cowInjectionInfoAndAiDates,
      createdAt: cow.date_and_time
    });
  }

  return cowsRecords;
}



async function getCowsByUserId(userId: number): Promise<Cow[]> {
  let cows = await sqlite3.select(queries.SELECT_COWS_RECORDS_BY_USER_ID_SQL, true, userId) as CowInDB[];
  const cowsRecords: Cow[] = [];
  for (let cow of cows) {
    const injectionInfoAndAiDates = await getInjectionInfoAndAiDatesByCowId(cow.id);
    cowsRecords.push({
      id: cow.id,
      name: cow.name,
      breed: cow.breed,
      bullName: cow.bull_name,
      injectionInfoAndAiDates: injectionInfoAndAiDates,
      createdAt: cow.date_and_time
    });
  }

  return cowsRecords;
}



async function getCowById(id: number): Promise<Cow | null> {
  validateId(id, "Cow");
  const cow = await sqlite3.select(queries.SELECT_COW_RECORD_BY_ID, false, id) as CowInDB;
  if (!cow) {
    return null;
  }

  const injectionInfoAndAiDates = await getInjectionInfoAndAiDatesByCowId(id);
  return {
    id: cow.id,
    name: cow.name,
    breed: cow.breed,
    bullName: cow.bull_name,
    injectionInfoAndAiDates: injectionInfoAndAiDates,
    createdAt: cow.date_and_time
  }
}



async function deleteAllCows(): Promise<void> {
  await sqlite3.delete(queries.DELETE_ALL_COWS_RECORDS_SQL);
  await sqlite3.delete(queries.DELETE_ALL_INJECTION_INFO_AND_AI_DATES_RECORDS_SQL);
}


 
async function deleteCowsByUserId(userId: number): Promise<void> {
  validateId(userId, "User");
  const cows = await getCowsByUserId(userId);
  for (let cow of cows) {
    await deleteInjectionInfoAndAiDatesByCowId(cow.id);
  }
  await sqlite3.delete(queries.DELETE_COWS_RECORDS_BY_USER_ID_SQL, userId);
}



async function deleteCowById(id: number) {
  validateId(id, "Cow");
  await sqlite3.delete(queries.DELETE_COW_RECORD_BY_ID_SQL, id);
  await deleteInjectionInfoAndAiDatesByCowId(id);
}



async function updateCowById(id: number, cowDataToUpdate: CowDataToUpdate): Promise<UpdatedCow> {
  validateId(id, "Cow");

  for (let [key, value] of Object.entries(cowDataToUpdate)) {
    key = key === "bullName" ? "bull_name" : key;
    const sql = queries.UPDATE_COW_RECORD_BY_ID.replace("<column_name>", key);
    await sqlite3.update(sql, value, id);
  }

  const { injectionInfoAndAiDates:_, ...updatedCow } = await getCowById(id) as Cow;
  return updatedCow;
}



export default {
  addNewCow,
  getAllCows,
  getCowById,
  getCowsByUserId,
  deleteAllCows,
  deleteCowById,
  deleteCowsByUserId,
  addNewInjectionInfoAndAiDatesToCow,
  getInjectionInfoAndAiDateById,
  deleteInjectionInfoAndAiDateById,
  deleteInjectionInfoAndAiDatesByCowId,
  updateCowById,
  updateInjectionInfoAndAiDateById
};