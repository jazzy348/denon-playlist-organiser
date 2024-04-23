//Written by Jazzy 19/04/2024
//This script is to organise Denon libraries by reading the SQLite database, creates folders for each playlist
//Then puts the songs into their assigned playlist folder. This is to make it easier to use on other DJ software

//This script makes some assumptions
//It assumes that the "m.db" file from the Denon database is in the same directory as this script
//This will create a new folder called "Organised" and will place the music in there

//!!!!WARNING!!!! This copies the files and may fill your storage


const sqlite3 = require('sqlite3');
const fs = require('fs');

// Load m.db from the local directory. m.db is where Denon stores all of the data for tracks and playlists.
let db = new sqlite3.Database('./m.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
	  process.exit(1);
    }
    console.log('Connected to the Denon database.');
  });

//Check of "Organised" directory exists in current working folder, create if not.
if (!fs.existsSync('./Organised/')){
  fs.mkdirSync('./Organised/');
}

//Run the SQL query to match the tracks to their playlist
db.serialize(() => {
  db.each(`SELECT Playlist.id as PlaylistId, Playlist.title, PlaylistEntity.listId, PlaylistEntity.trackId, Track.path, Track.filename
           FROM Playlist, PlaylistEntity, Track 
           WHERE Playlist.id = PlaylistEntity.listId AND PlaylistEntity.trackId = Track.originTrackId AND Track.originDatabaseUuid = PlaylistEntity.databaseUuid`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
	//Create playlist folder inside "Organised" if it doesn't exist
    if (!fs.existsSync('./Organised/'+row.title)){
      fs.mkdirSync('./Organised/'+row.title);
    }
	//Try to copy the file into the playlist directory. We use a try catch here incase the file name is too long or incase copy go brr.
    try {
        fs.cpSync(row.path, "./Organised/"+row.title+"/"+row.filename);
    } catch (e) {
	    //Should probably log this somewhere else as the console can get pretty busy
        console.log(e);
    }
    	//Log each copy we're doing
    console.log(row.title + "\t" + row.path);
    //return;
  });
});

//Close connection to the database and exit.
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
