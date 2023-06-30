const ServiceUser = require('../../models/serviceUser');
const Organization = require('../../models/organization');
const ServiceUserToOrganization = require('../../models/serviceUserToOrganization');
const db = require('../../config/database');

const { convertRaw } = require('../../util/dbUtils');

// admin:boolean (optional) - determines whether the result set includes admins or not
async function getAllMembers(orgName, admin) {
  // admin can be True/False/undefined
  if (admin !== undefined && typeof admin !== 'boolean') {
    throw TypeError("parameter 'admin' should be type boolean");
  }
  if (admin === undefined) {
    // get all
  } else if (admin) {
    // get all admins
  } else {
    // get all non admins
  }
}
// TODO: modify permissions
async function setPermission(username, orgname, perms) {}
// TODO: add user to organization
async function addUser(username, orgname) {}
// TODO: remove user from organization
async function removeUser(username, orgname) {}
// TODO: create organization
// addUser(username) to the org and setPermissions(username,orgname,perms) after creation
// perms = {admin=t, read=t, write=t, del=t}
async function add(orgName, username) {
  try {
    return await db.transaction(async (t) => {
      const org = await Organization.create({ org_name: orgName }, { transaction: t });
      const userOrgs = await ServiceUserToOrganization.create(
        {
          organization: orgName,
          username,
          admin_perm: true,
          read_perm: true,
          write_perm: true,
          del_perm: true,
        },
        { transaction: t },
      );
      return Promise.resolve({
        organizations: await convertRaw(org),
        member: await convertRaw(userOrgs),
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}
async function remove(orgName) {
  return Organization.destroy({
    where: { org_name: orgName },
  });
}

module.exports = {
  getAllMembers,
  setPermission,
  addUser,
  removeUser,
  add,
  remove,
};
