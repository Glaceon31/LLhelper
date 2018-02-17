/*
 * Common song filter/select script
 *
 * By ben1222
 */

function LLSong(songjson) {
   var defaultsong = new Array()
   defaultsong["name"] = "默认曲目（缪）"
   defaultsong["jpname"] = "默认曲目（缪）"
   defaultsong["muse"] = 1
   defaultsong["aqours"] = 0
   defaultsong['attribute'] = ''
   var defaultsong2 = new Array()
   defaultsong2["name"] = "默认曲目（水）"
   defaultsong2["jpname"] = "默认曲目（水）"
   defaultsong2["muse"] = 0
   defaultsong2["aqours"] = 1
   defaultsong2['attribute'] = ''
   var expert_default = new Array()
   expert_default["positionweight"] = [63.75,63.75,63.75,63.75,0,63.75,63.75,63.75,63.75]
   expert_default["combo"] = 500
   expert_default["time"] = 110
   expert_default["star"] = 65
   var master_default = new Array()
   master_default["positionweight"] = [87.5,87.5,87.5,87.5,0,87.5,87.5,87.5,87.5]
   master_default["combo"] = 700
   master_default["time"] = 110
   master_default["star"] = 65
   defaultsong["expert"] = expert_default
   defaultsong["master"] = master_default
   defaultsong["type"] = "0"
   defaultsong2["expert"] = expert_default
   defaultsong2["master"] = master_default
   defaultsong2["type"] = "0"
   var songs = eval("("+songsjson+")");
   songs["00"] = defaultsong
   songs["01"] = defaultsong2

   var attcolor = new Array();
   attcolor["smile"] = "red"
   attcolor["pure"] = "green"
   attcolor["cool"] = "blue"
   attcolor[""] = "purple"

   this.songs = songs;
   this.attcolor = attcolor;
   this.language = 0;
   this.songSelId = 'songchoice';
   this.songAttId = 'songatt';
   this.songUnitId = 'songunit';
   this.songSearchId = 'songsearch';
   this.getElementValue = function (id, defaultValue) {
      var ret = undefined;
      var element = document.getElementById(id);
      if (element) ret = element.value;
      if (ret === undefined) return defaultValue;
      return ret;
   };
   this.getElementOrThrow = function (id) {
      var ret = document.getElementById(id);
      if (!ret) {
         throw ("Not found " + id);
      }
      return ret;
   };
   this.filterSongs = function (songsel, songatt, songunit, keyword) {
      if (songsel === undefined) songsel = this.getElementOrThrow(this.songSelId);
      if (songatt === undefined) songatt = this.getElementValue(this.songAttId, "");
      if (songunit === undefined) songunit = this.getElementValue(this.songUnitId, "");
      if (keyword === undefined) keyword = this.getElementValue(this.songSearchId, "");

      var lastSelected = songsel.value;
      var keepLastSelected = false;
      songsel.options.length = 1;
      if (keyword) keyword = keyword.toLowerCase();
      var songKeys = Object.keys(this.songs).sort();
      for (var i = 0; i < songKeys.length; i++) {
         var index = songKeys[i];
         var curSong = this.songs[index];
         if (songatt && !((songatt == curSong.attribute) || (curSong.attribute == ""))) {
            continue;
         }
         if (songunit && !(curSong[songunit] == 1)) {
            continue;
         }
         if (keyword && !((curSong.name.toLowerCase().indexOf(keyword) != -1) || (curSong.jpname.toLowerCase().indexOf(keyword) != -1))) {
            continue;
         }
         var newOption;
         if (this.language == 0)
            newOption = new Option(curSong.name, index);
         else
            newOption = new Option(curSong.jpname, index);
         newOption.style.color = this.attcolor[curSong.attribute];
         songsel.options.add(newOption);

         if (index == lastSelected) keepLastSelected = true;
      }
      if (keepLastSelected) {
         songsel.value = lastSelected;
      }
   };
   this.showAllSongs = function (songsel) {
      this.filterSongs(songsel, "", "", "");
   };
}

