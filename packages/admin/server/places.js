
K.Admin.methods({
	removePlace: function(placeId) {

		if(!K.Admin.isMe()) return null;

		if(_.isString(placeId)) {

			Places.remove({_id: placeId});
	/*		Users.update(Meteor.userId(), {
				$pull: {
					places: placeId
				}
			});*/
			//TODO remove ref

			console.log('Admin: removePlace', placeId);
		}
	},
	removeAllPlaces: function() {

		if(!K.Admin.isMe()) return null;
		
		Places.remove({});
		
		console.log('Admin: removeAllPlaces');
	},	
	updatePlace: function(placeId, data) {
		
		if(!K.Admin.isMe()) return null;

		var placeData = Places.findOne(placeId);

		Places.update(placeId, {
			$set: {
				name: K.Util.sanitize.name(data.name)
			}
		});

		console.log('Admin: updatePlace', data.name);	
	},
	updatePlaceAuthor: function(placeName, userName) {
		
		if(!K.Admin.isMe()) return null;

		var placeData = Places.findOne({name: placeName}),
			userData = Users.findOne({username: userName});

		if(placeData && userData) {

			Places.update(placeData._id, {
				$set: {
					userId: userData._id
				}
			});

			Users.update(userData._id, {
				$addToSet: {
					places: placeData._id
				}
			});

			console.log('Admin: updatePlaceAuthor', placeName, userName);
		}
	},	
	movePlace: function(placeId, loc) {

		if(!K.Admin.isMe()) return null;

		Places.update(placeId, {
			$set: {loc: loc}
		});

		console.log('Admin: movePlace', placeId, loc);
	},	
	cleanPlaceHist: function(placeName) {
		
		if(!K.Admin.isMe()) return null;

		var placeData = Places.findOne({name: placeName}),
			placeId = placeData._id;

		if(placeData.hist)
			Users.update({_id: {$in: placeData.hist }}, {
				$pull: {
					hist: placeId
				}
			},{ multi: true });
		
		Places.update(placeId, {
			$set: {
				hist: []
			}
		});

		console.log('Admin: cleanPlaceHist', placeName);
	},
	cleanPlaceCheckins: function(placeName) {
		
		if(!K.Admin.isMe()) return null;

		var placeData = Places.findOne({name: placeName}),
			placeId = placeData._id;

		if(placeData.checkins) {
			Users.update({_id: {$in: placeData.checkins }}, {
				$set: {
					checkin: null
				}
			},{ multi: true });
		}

		Places.update(placeId, {
			$set: {
				checkins: []
			}
		});

		console.log('Admin: cleanPlaceCheckins', placeName);
	},
	cleanAllHist: function() {
		
		if(!K.Admin.isMe()) return null;

		Users.update({}, {$set: {hist: []} }, { multi: true });
		Places.update({}, {$set: {hist: []} }, { multi: true });

		console.log('Admin: cleanAllHist');
	},	
	cleanAllCheckins: function() {
		
		if(!K.Admin.isMe()) return null;

		Users.update({}, {$set: {checkin: null} }, { multi: true });
		Places.update({}, {$set: {checkins: []} }, { multi: true });

		console.log('Admin: cleanAllCheckins');
	},
	sanitizePlacesField: function(field, func) {

		if(!K.Admin.isMe() || !field || !K.Util.sanitize[func] ) return null;

		var filter = {},
			count = 0
		
		filter[field]= {'$exists':true, '$ne':null, '$ne': ''};

		Places.find(filter).forEach(function(place) {
			
			var set = {};
			
			set[field] = K.Util.sanitize[func]( K.Util.getPath(place,field) );

			count += Places.update(place._id, {
				$set: set
			});

		});

		console.log('Admin: sanitizePlacesField', field, func, count);
	}
});
