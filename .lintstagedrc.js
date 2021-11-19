module.exports = {
  '**/*.ts?(x)': (filenames) =>
    `next lint --fix --file ${filenames
      .map((file) => file.split(process.cwd())[1])
      .join(' --file ')}`,
  '**/*.less': (filenames) =>
    ` stylelint --fix  ./${filenames
      .map((file) => file.split(process.cwd())[1])
      .join(' --file ')}`,
}
// stylelint **/*.{css,less} --fix
