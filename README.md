# modella-save-invalid

Skip those pesky validations, sometimes.

## What it does

This plugin overloads `model.save` to the following signature: `model.save([skipValidations], cb)`. With out a boolean as
the first argument, the behavior is identical to `modella`'s default.

With the additional flag, it will skip validations. Optionally if `SaveInvalid.invalidAttr` is set, an invalid model will have
that attribute persisted as well. This is useful so that you can only query for valid models. E.g:

    var validTasks = Tasks.all({invalid: false}, function(err, tasks) {
      // Do something
    });

## Usage Example

    var SaveInvalid = require('modella-save-invalid');

    SaveInvalid.invalidAttr = 'invalid' // Optional, will persist the status into the database

    User.use(SaveInvalid); // Assume some model w/ validations.


    var user = new User();

    user.username('Bobby');

    // Assume user is still invalid.

    user.save() // Will emit error and not save.
    user.save(function(err) {
      err == undefined // Will be false
    });

    user.save(true) // Will save user in db and user.invalid() will be true
    user.save(true, function(err) {
      err == undefined // Will be true (assuming no sync-layer errors)
    });
