//Written by Jazzy 19/04/2024
//This script is to organise Denon libraries by reading the SQLite database, creates folders for each playlist
//Then puts the songs into their assigned playlist folder. This is to make it easier to use on other DJ software

//This script makes some assumptions
//It assumes that the "m.db" file from the Denon database is in the same directory as this script
//This will create a new folder called "Organised" and will place the music in there

//!!!!WARNING!!!! This copies the files and may fill your storage


const sqlite3 = require('sqlite3');
const fs = require('fs');

let db = new sqlite3.Database('./m.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
	  process.exit(1);
    }
    console.log('Connected to the Denon database.');
  });

if (!fs.existsSync('./Organised/')){
  fs.mkdirSync('./Organised/');
}

db.serialize(() => {
  db.each(`SELECT Playlist.id as PlaylistId, Playlist.title, PlaylistEntity.listId, PlaylistEntity.trackId, Track.path, Track.filename
           FROM Playlist, PlaylistEntity, Track 
           WHERE Playlist.id = PlaylistEntity.listId AND PlaylistEntity.trackId = Track.originTrackId AND Track.originDatabaseUuid = PlaylistEntity.databaseUuid`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (!fs.existsSync('./Organised/'+row.title)){
      fs.mkdirSync('./Organised/'+row.title);
    }
    try {
        fs.cpSync(row.path, "./Organised/"+row.title+"/"+row.filename);
    } catch (e) {
        console.log(e);
    }
    
    console.log(row.title + "\t" + row.path);
    //return;
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
