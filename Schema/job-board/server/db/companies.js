import { connection } from './connection.js';

const getCompanyTable = () => connection.table('company');

export async function getCompany(id) {
  console.log("inside the id ",id)
  return await getCompanyTable().first().where({ id });
}
