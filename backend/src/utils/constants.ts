import path from "path";


export const SQLITE3_DATABASE_DIR_PATH = path.join(__dirname, "../db/sqlite3/db/");
export const RECORDS_CSV_FILE_PATH = path.join(__dirname, "../data/records.csv");

export const HEADER_COMPONENT_FILE_PATH = path.join(__dirname, "../../../client/views/components/header.component.html");
export const INDEX_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/index.html");
export const HOME_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/pages/home.html");
export const ADD_NEW_RECORD_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/pages/add-new-record.html");
export const STATIC_FILES_PATH = path.join(__dirname, "../../../client/public");
export const SUPER_USER_LOGIN_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/pages/super-user-login.html");
export const DASHBOARD_PAGE_FILE_PATH =  path.join(__dirname, "../../../client/views/pages/dashboard.html");
export const SHOW_RECORD_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/pages/show-record.html");
export const ABOUT_PAGE_FILE_PATH = path.join(__dirname, "../../../client/views/pages/about.html");


export const CSV_WRITER_HEADERS = [
  {id: "id", title: "USER_ID"},
  {id: "name", title: "NAME"},
  {id: "phoneNumber", title: "PHONE_NUMBER"},
  {id: "address", title: "ADDRESS"},
  {id: "cowNames", title: "COW_NAMES"},
  {id: "cowBreeds", title: "COW_BREEDS"},
  {id: "bullNames", title: "BULL_NAMES"},
  {id: "injectionNames", title: "INJECTION_NAMES"},
  {id: "injectionPrices", title: "INJECTION_PRICES"}, 
  {id: "givenAmounts", title: "GIVEN_AMOUNTS"},
  {id: "pendingAmounts", title: "PENDING_AMOUNTS"},
  {id: "dates", title: "AI_DATE"},
  {id: "recordCreatedAt", title: "DATE_AND_TIME_IN_DB"}
];