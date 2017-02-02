/*
First item is centre of object, and ignores position.

posX: left-right
posY: up from table
posZ: up-down

rotX: 
rotY: 
rotZ: 

scale defaults to 0
*/

var json = {
	ObjectStates: [
		{
			Name: "Deck",
			Transform: {
	          rotX: 0,	// axis from left to right.		+ tips forward.
	          rotY: 180,	// axis INTO card.			+ rotates clockwise.	0 upside down
	          rotZ: 0,	// axis top to bottom of card.	+ tips left.			0 face up
	          scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0
	        },
			Nickname: "Name, searchable",
			Grid: false,
			CustomDeck: { // card sheets
				d: { // deck number
					FaceURL: "url", BackURL: "url",
					NumWidth: 10, NumHeight: 7,	// layout
					BackIsHidden: true,			// use normal backs when card is hidden
					UniqueBack: true			// use back as card sheet
				}
			},
			DeckIDs: [dnn, dnn, dnn /* ... */], // d = deck number, nn = card index within deck
			ContainedObjects: [ // same order as DeckIDs
				{ Name: "Card", CardID: dnn,
		  			Nickname: "Name, searchable", "Description": "Extra info, not searchable",
		  			Grid: false, "Locked": false, Sticky: false,
		  			Transform: { "scaleX": 1, "scaleY": 1, "scaleZ": 1 }
				},
			]
		}
	]
};