var noop = function(){};

var SaveInvalid = module.exports = function(Model) {
  Model.prototype.save = function(skipValidations, cb) {
    var args = [].slice.call(arguments),
        self = this,
        save = this.model.save,
        isNew = this.isNew(),
        fn, skipValidations;

    skipValidations = args.shift();
    if(typeof skipValidations == 'boolean') {
      fn = args.pop() || noop;
    } else {
      fn = skipValidations || noop;
      skipValidations = false;
    }

    if (!isNew) {
      var changed = this.changed();
      save = this.model.update;
      if(!changed) return fn(null, this);
    }

    if (!this.isValid()) {
      if(skipValidations) {
        if(SaveInvalid.invalidAttr)
          this.attrs[SaveInvalid.invalidAttr] = true;

        if(SaveInvalid.completeAttr)
          this.attrs[SaveInvalid.completeAttr] = false;
      } else {
        this.primary(null);
        return fn(new Error('validation failed'));
      }
    } else {
      if(SaveInvalid.invalidAttr)
        this.attrs[SaveInvalid.invalidAttr] = false;
      if(SaveInvalid.completeAttr)
        this.attrs[SaveInvalid.completeAttr] = true;
    }

    this.run('saving', function() {
      save.apply(self, args.concat(res));
    });

    function res(err, body) {
      if (err) {
        self.emit('error', err);
        return fn(err);
      }

      if (body) {
        self.primary(body.id || body._id);
        self.set(body);
      }
      self.dirty = {};
      self.model.emit('save', self);
      if(isNew) {
        self.model.emit('create', self);
        self.emit('create');
      }
      self.emit('save');
      fn(null, self);
    }
  };
};
