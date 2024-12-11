import User from "../models/user.model";
import Cow from "../models/cow.model";
import csvWriter from "../utils/csvWriter";
import { CSV_WRITER_HEADERS } from "../utils/constants";
import {  
  User as UserRecord,
  Cow as CowRecord,
  NewCow,
  NewRecord,
  Record,
  InjectionInfoAndAiDate,
  UserDataToUpdate,
  CowDataToUpdate,
  UpdatedCow,
  InjectionInfoAndAiDateDataToUpdate,
} from "../utils/types";



async function createNewRecord(record: NewRecord): Promise<Record> {
  const newUser = await User.addNewUser(record.user);
  const newCows = [];
  for (let cow of record.cows) {
    const newCow = await Cow.addNewCow({
      userId: newUser.id,
      name: cow.name,
      breed: cow.breed,
      bullName: cow.bullName,
      injectionInfoAndAiDates: cow.injectionInfoAndAiDates
    });
    newCows.push(newCow);
  }
  
  return {
    user: newUser,
    cows: newCows,
    recordCreatedAt: newUser.createdAt
  };
}



async function isPhoneNumberAlreadyInUse(phoneNumber: number): Promise<boolean> {
  const user = await User.getUserByPhoneNumber(phoneNumber);
  return user ? true : false;
}



async function hasUserRecord(userId: number): Promise<boolean> {
  const user = await User.getUserById(userId);
  return user ? true : false;
}



async function hasCowRecord(cowId: number) {
  const cow = await Cow.getCowById(cowId);
  return cow ? true : false
}



async function hasInjectionInfoAndAiDateRecord(id: number): Promise<boolean> {
  const injectionInfoAndAiDate = await Cow.getInjectionInfoAndAiDateById(id);
  return injectionInfoAndAiDate ? true : false;
}



async function getAllRecords(): Promise<Array<Record>> {
  const users = await User.getAllUsers();
  const cows = await Cow.getAllCows();
  const records: Array<Record> = [];

  for (let user of users) {
    const userCows: CowRecord[] = cows
      .filter(({userId}) => userId === user.id)
      .map(({id, name, breed, bullName, injectionInfoAndAiDates, createdAt}) => {
        return {id, name, breed, bullName, injectionInfoAndAiDates, createdAt}
      });

    records.push({
      user: user,
      cows: userCows,
      recordCreatedAt: user.createdAt
    });
  }

  return records;
}



async function getRecordByUserId(userId: number): Promise<Record> {
  const user = await User.getUserById(userId) as UserRecord;
  const cows = await Cow.getCowsByUserId(userId);
  return {
    user: user,
    cows: cows,
    recordCreatedAt: user.createdAt
  };
}



async function deleteAllRecords(): Promise<void> {
  await User.deleteAllUsers();
  await Cow.deleteAllCows();
}


async function deleteRecordByUserId(userId: number): Promise<void> {
  await User.deleteUserById(userId);
  await Cow.deleteCowsByUserId(userId);
}



async function addNewCowToUser(userId: number, newCow: NewCow): Promise<CowRecord> {
  return await Cow.addNewCow({
    userId: userId,
    name: newCow.name,
    breed: newCow.breed,
    bullName: newCow.bullName,
    injectionInfoAndAiDates: newCow.injectionInfoAndAiDates
  });
}



async function deleteCowFromUser(cowId: number): Promise<void> {
  await Cow.deleteCowById(cowId);
}



async function deleteAllCowsFromUser(userId: number) {
  await Cow.deleteCowsByUserId(userId);
}



async function addNewInjectionInfoAndAiDateToCow(cowId: number, injectionInfoAndAiDates: InjectionInfoAndAiDate): Promise<InjectionInfoAndAiDate> {
  const injectionInfoAndAiDate =  await Cow.addNewInjectionInfoAndAiDatesToCow(cowId, [injectionInfoAndAiDates]);
  return injectionInfoAndAiDate[injectionInfoAndAiDate.length -1];
}



async function removeInjectionInfoAndAiDateFromCow(id: number): Promise<void> {
  await Cow.deleteInjectionInfoAndAiDateById(id);
}



async function removeAllInjectionInfoAndAiDateFromCow(cowId: number): Promise<void> {
  await Cow.deleteInjectionInfoAndAiDatesByCowId(cowId);
}


async function updateUserRecordById(id: number, userDataToUpdate: UserDataToUpdate): Promise<UserRecord> {
  return await User.updateUserById(id, userDataToUpdate);
}



async function updateCowRecordById(id: number, cowDataToUpdate: CowDataToUpdate): Promise<UpdatedCow>  {
  return await Cow.updateCowById(id, cowDataToUpdate);
}



async function updateInjectionInfoAndAiDate(id: number, injectionInfoAndAiDatesDataToUpdate: InjectionInfoAndAiDateDataToUpdate) {
  return await Cow.updateInjectionInfoAndAiDateById(id, injectionInfoAndAiDatesDataToUpdate);
}



async function writeRecordsToFile(path: string) {
  const recordsInDB = await getAllRecords();

  function extractCowInformation(cows: CowRecord[]): {
    cowNames: string[], cowBreeds: string[], bullNames: string[], injectionNames: string[], 
    injectionPrices: number[], givenAmounts: number[], pendingAmounts: number[], dates: string[]
  } {
    const cowNames: string[] = [];
    const cowBreeds: string[] = [];
    const bullNames: string[] = [];
    const injectionNames: string[] = [];
    const injectionPrices: number[] = [];
    const givenAmounts: number[] = [];
    const pendingAmounts: number[] = [];
    const dates: string[] = [];

    for (let cow of cows) {
      cowNames.push(cow.name);
      cowBreeds.push(cow.breed);
      bullNames.push(cow.bullName);

      for (let injectionInfoAndAiDate of cow.injectionInfoAndAiDates) {
        injectionNames.push(injectionInfoAndAiDate.name);
        injectionPrices.push(injectionInfoAndAiDate.price);
        givenAmounts.push(injectionInfoAndAiDate.givenAmount);
        pendingAmounts.push(injectionInfoAndAiDate.pendingAmount);
        dates.push(injectionInfoAndAiDate.date);
      }
    }

    return {
      cowNames, cowBreeds, bullNames, injectionNames, 
      injectionPrices, givenAmounts, pendingAmounts, dates
    };
  }
  
  const records: any = recordsInDB.map((record) => {
    const { 
      cowNames, cowBreeds, bullNames, injectionNames, 
      injectionPrices, givenAmounts, pendingAmounts, dates 
    } = extractCowInformation(record.cows);

    return {
      id:record.user.id,
      name:record.user.name,
      phoneNumber:record.user.phoneNumber,
      address:record.user.address,
      cowNames: `[${cowNames}]`,
      cowBreeds: `[${cowBreeds}]`,
      bullNames: `[${bullNames}]`,
      injectionNames: `[${injectionNames}]`,
      injectionPrices: `[${injectionPrices}]`,
      givenAmounts: `[${givenAmounts}]`,
      pendingAmounts: `[${pendingAmounts}]`,
      dates: `[${dates}]`,
      recordCreatedAt: record.recordCreatedAt
    }
  });
  await csvWriter.writeRecords({distFilePath: path, csvHeader: CSV_WRITER_HEADERS}, records);
}



export default {
  createNewRecord,
  isPhoneNumberAlreadyInUse,
  getAllRecords,
  getRecordByUserId,
  hasUserRecord, hasCowRecord,
  hasInjectionInfoAndAiDateRecord,
  deleteAllRecords,
  deleteRecordByUserId,
  deleteAllCowsFromUser,
  addNewCowToUser,
  deleteCowFromUser,
  addNewInjectionInfoAndAiDateToCow,
  removeInjectionInfoAndAiDateFromCow,
  removeAllInjectionInfoAndAiDateFromCow,
  updateUserRecordById,
  updateCowRecordById,
  updateInjectionInfoAndAiDate,
  writeRecordsToFile
};