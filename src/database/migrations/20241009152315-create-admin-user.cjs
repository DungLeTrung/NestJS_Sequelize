'use strict';

/** @type {import('sequelize-cli').Migration} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminUser = {
      username: 'admin',
      email: 'admin@adamo.com',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      phone_number: '0123456789',
      password: await bcrypt.hash('abcd1234', 10),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      first_name: 'Admin',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      last_name: 'Loyalty',
      role: 'ADMIN',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      is_active: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: new Date(),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('users', [adminUser], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@adamo.com' }, {});
  },
};
