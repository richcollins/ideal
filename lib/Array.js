(function(){
	"use strict";
	
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	ideal.Object_shallowCopyTo({
		//read
		isEmpty: function()
		{
			return this.length == 0;
		},

		isEqual: function(otherArray)
		{
			if(this.length != otherArray.length) { return false; }

			for (var i = 0; i < this.length; i ++)
			{
				if(this[i] != otherArray[i]) return false;
			}

			return true;
		},

		size: function()
		{
			return this.length;
		},

		at: function(index)
		{
			if(index > -1)
			{
				return this[index];
			}
			else
			{
				return this[this.length + index];
			}
		},

		first: function()
		{
			return this[0];
		},

		rest: function()
		{
			return this.slice(1);
		},

		last: function()
		{
			return this[this.length - 1];
		},

		contains: function(element)
		{
			return this.indexOf(element) > -1;
		},

		hasPrefix: function(otherArray)
		{
			if(this.length < otherArray.length) { return false; }

			for (var i = 0; i < this.length; i ++)
			{
				if(this[i] != otherArray[i]) return false;
			}

			return true;
		},

		itemAfter: function(v)
		{
			var i = this.indexOf(v);
			if(i == -1) return null;
			i = i + 1;
			if(i > this.length - 1) return null;
			if(this[i] != undefined) { return this[i]; }
			return null;
		},

		itemBefore: function(v)
		{
			var i = this.indexOf(v);
			if(i == -1) return null;
			i = i - 1;
			if(i < 0) return null;
			if(this[i]) { return this[i]; }
			return null;
		},

		copy: function()
		{
			return this.slice();
		},

		split: function(subArrayCount)
		{
			var subArrays = [];

			var subArraySize = Math.ceil(this.length / subArrayCount);
			for (var i = 0; i < this.length; i += subArraySize)
			{
				var subArray = this.slice(i, i + subArraySize);
				if(subArray.length < subArraySize)
				{
					var lastSubArray = subArrays.pop();
					if(lastSubArray)
					{
						subArray = lastSubArray.concat(subArray);
					}
				}
				subArrays.push(subArray);
			}

			return subArrays;
		},

		//write

		atInsert: function(i, e)
		{
			this.splice(i, 0, e);
		},

		append: function()
		{
			this.appendItems.call(this, arguments);
			return this;
		},

		appendItems: function(elements)
		{
			this.push.apply(this, elements);
			return this;
		},
		
		appendItemsIfAbsent: function(elements)
		{
			this.appendIfAbsent.apply(this, elements);
			return this;
		},

		prepend: function(e)
		{
			this.unshift(e);
			return this;
		},

		appendIfAbsent: function()
		{
			var self = this;;
			this.slice.call(arguments).forEach(function(value)
			{
				if(self.indexOf(value) == -1)
				{
					self.push(value);
					return true;
				}
			})

			return false;
		},

		removeAt: function(i)
		{
			this.splice(i, 1);
			return this;
		},

		remove: function(e)
		{
			var i = this.indexOf(e);
			if(i > -1)
			{
				this.removeAt(i);
			}
			return this;
		},

		removeFirst: function ()
		{
			return this.shift();
		},

		removeLast: function()
		{
			return this.pop();
		},

		removeItems: function(elements)
		{
			elements.forEach(function(e){ this.remove(e) }, this);
			return this;
		},

		empty: function()
		{
			this.splice(0, this.length);
			return this;
		},

		replace: function(obj, withObj)
		{
			var i = this.indexOf(obj);
			if (i > -1)
			{
				this.removeAt(i);
				this.atInsert(i, withObj);
			}
			return this;
		},

		swap: function(e1, e2)
		{
			var i1 = this.indexOf(e1);
			var i2 = this.indexOf(e2);

			this[i1] = e2;
			this[i2] = e1;

			return this;
		},

		shuffle: function()
		{
			var i = this.length;
			if(i == 0) return false;
			while (-- i)
			{
				var j = Math.floor(Math.random() * ( i + 1 ));
				var tempi = this[i];
				var tempj = this[j];
				this[i] = tempj;
				this[j] = tempi;
			}
		},
		
		atRandom: function()
		{
			return this[Math.floor(Math.random() * this.length)];
		},

		//iterate
		forEachCall: function(functionName)
		{
			var args = this.slice.call(arguments).slice(1);
			args.push(0);
			this.forEach(function(e, i)
			{
				args[args.length - 1] = i;
				if (e)
				{
					e[functionName].apply(e, args);
				}
			});
			return this;
		},

		forEachPerform: function()
		{
			return this.forEachCall.apply(this, arguments);
		},

		sortPerform: function(functionName)
		{
			var args = this.slice.call(arguments).slice(1);
			return this.sort(function(x, y)
			{
				var xRes = x[functionName].apply(x, args);
				var yRes = y[functionName].apply(y, args);
				if(xRes < yRes)
				{
					return -1;
				}
				else if(yRes < xRes)
				{
					return 1;
				}
				else
				{
					return 0;
				}
			});
		},
		
		parallelPerform: function() {
		  var args = this.slice.call(arguments).slice();
		  var fn = args.pop();
		  
		  if (this.length == 0) {
		    fn(null);
		    return;
		  }
		  
		  var completed = 0;
		  var err = null;
		  var self = this;
		  args.push(function(error){
		    err = error;
		    completed ++;
		    if (completed == self.length) {
		      fn(err);
		    }
		  });
		  this.forEachCall.apply(this, args);
		  return this;
		},
		
		serialPerform: function(functionName) {
		  var args = this.slice.call(arguments).slice(1);
		  var fn = args.pop();
		  
		  if (this.length == 0) {
		    fn(null);
		    return;
		  }
		  
		  args.push(function(error){
		    if (error) {
		      fn(error);
		      return true;
		    } else {
		      return false;
		    }
		  });
		  
		  for (var i = 0; i < this.length; i ++) {
		    if (this[i][functionName].apply(this.args)) {
		      break;
		    }
		  }
		  
		  this.forEachCall.apply(this, args);
		  return this;
		},

		mapPerform: function(functionName)
		{
			var args = this.slice.call(arguments).slice(1);
			args.push(0);
			return this.map(function(e, i)
			{
				args[args.length - 1] = i;
				return e[functionName].apply(e, args);
			});
		},
		
		mapProperty: function(propertyName)
		{
			return this.map(function(var e){
			  return e[propertyName];
			});
		},

		detect: function(callback)
		{
			for (var i = 0; i < this.length; i++)
			{
				if(callback(this[i]))
				{
					return this[i];
				}
			}

			return null;
		},

		detectPerform: function(functionName)
		{
			var args = this.slice.call(arguments).slice(1);
			return this.detect(function(e, i)
			{
				return e[functionName].apply(e, args);
			});
		},

		detectSlot: function(slotName, slotValue)
		{
			for (var i = 0; i < this.length; i++)
			{
				if (this[i].perform(slotName) == slotValue)
				{
					return this[i];
				}
			}

			return null;
		},

		detectProperty: function(slotName, slotValue)
		{
			for (var i = 0; i < this.length; i++)
			{
				if (this[i][slotName] == slotValue)
				{
					return this[i];
				}
			}

			return null;
		},

		detectIndex: function(callback)
		{
			for (var i = 0; i < this.length; i++)
			{
				if(callback(this[i]))
				{
					return i;
				}
			}

			return null;
		},

		filterPerform: function(messageName)
		{
			var args = this.slice.call(arguments).slice(1);
			args.push(0);
			return this.filter(function(e, i)
			{
				args[args.length - 1] = i;
				return e[messageName].apply(e, args);
			});
		},

		rejectPerform: function(messageName)
		{
			var args = this.slice.call(arguments).slice(1);
			args.push(0);
			return this.filter(function(e, i)
			{
				args[args.length - 1] = i;
				return !e[messageName].apply(e, args);
			});
		},

		minValue: function(callback, theDefault)
		{
			var obj = this.min(callback);
			if(obj == undefined) 
			{
				return theDefault;
			}
			return callback(obj);
		},

		maxValue: function(callback, theDefault)
		{
			var obj = this.max(callback);
			if(obj == undefined) 
			{
				return theDefault;
			}
			return callback(obj);
		},

		max: function(callback)
		{
			var m = undefined;
			var mObject = undefined;
			var length = this.length;

			for (var i = 0; i < length; i++)
			{
				var v = this[i];
				if(callback) v = callback(v);

				if(m == undefined || v > m)
				{
					m = v;
					mObject = this[i];
				}
			}

			return mObject;
		},

		maxIndex: function(callback)
		{
			var m = undefined;
			var index = 0;
			var length = this.length;

			for (var i = 0; i < length; i++)
			{
				var v = this[i];
				if(callback) v = callback(v);

				if(m == undefined || v > m)
				{
					m = v;
					index = i;
				}
			}

			return index;
		},

		min: function(callback)
		{
			var m = undefined;
			var mObject = undefined;
			var length = this.length;

			for (var i = 0; i < length; i++)
			{
				var v = this[i];
				if(callback) v = callback(v);

				if(m == undefined || v < m)
				{
					m = v;
					mObject = this[i];
				}
			}

			return mObject;
		},

		minIndex: function(callback)
		{
			var m = undefined;
			var index = 0;
			var length = this.length;

			for (var i = 0; i < length; i++)
			{
				var v = this[i];
				if(callback) v = callback(v);

				if(m == undefined || v < m)
				{
					m = v;
					index = i;
				}
			}

			return index;
		},

		sum: function(callback)
		{
			var m = undefined;
			var sum = 0;
			var length = this.length;

			for (var i = 0; i < length; i++)
			{
				var v = this[i];
				if(callback) v = callback(v);

				sum = sum + v;
			}

			return sum;
		},
		
		average: function()
		{
			return this.sum() / this.length;
		},
		
		atMidpoint: function()
		{
			return this.at(Math.floor((this.length - 1)/2));
		},

		flatten: function()
		{
			var flattened = [];
			this.forEach(function(array){
				flattened.appendItems(array);
			});
			return flattened;
		},

		clone: function()
		{
			return this.copy();
		},
		
		unique: function()
		{
			var a = [];
			this.forEach(function(e){
				a.appendIfAbsent(e);
			});
			return a;
		},
		
		reversed: function()
		{
			return this.copy().reverse();
		},
		
		asPath: function()
		{
			if (this.length == 1 && this.first() == "")
			{
				return "/";
			}
			else
			{
				return this.join("/");
			}
		},
		
		isAbsolutePath: function()
		{
			return this.first() == "";
		},
		
		isRelativePath: function()
		{
			return this.first() != "";
		},
		
		isArray: true
	}, Array.prototype);
	
	Array.wrap = function(obj)
	{
		if (obj === null || obj === undefined)
		{
			return [];
		}
		else if (obj.isArray)
		{
			return obj;
		}
		else
		{
			return [obj];
		}
	}
})();