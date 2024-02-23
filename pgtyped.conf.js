require('dotenv').config();

module.exports = {
  transforms: [
    {
      mode: "sql",
      include: "**/*.sql",
      emitTemplate: "{{dir}}/{{name}}.raw-query.ts",
    },
  ],
  srcDir: "./src",
  dbUrl: process.env.DATABASE_URL,
};
