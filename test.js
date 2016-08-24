const diff = require('./index');


diff([
    __dirname + '/original.txt',
    __dirname + '/modified1.txt',
    __dirname + '/modified2.txt'
]).then(() => {
    console.log('Diff was built');
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});