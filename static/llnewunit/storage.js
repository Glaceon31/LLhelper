(function () {

  var localStorageKey = 'llhelper_unit_storage__';

  function loadUnitFromJSON(json) {
    console.log(json);
    var unit = JSON.parse(json);
    handleLoadUnit(unit);
  }

  function readUnitJSON(name) {
    var json;
    try {
      json = JSON.parse(localStorage.getItem(localStorageKey));
    } catch (e) {
      json = {};
    }
    if (json == null || json === '') {
      json = {};
    }
    if (typeof name === 'undefined') {
      return json;
    }
    return json[name];
  }

  function saveUnitJSON(name, json) {
    var savedJSON = readUnitJSON();
    savedJSON[name] = json;
    localStorage.setItem(localStorageKey, JSON.stringify(savedJSON));
    loadList();
  }

  function deleteUnitJSON(name) {
    var savedJSON = readUnitJSON();
    delete savedJSON[name];
    localStorage.setItem(localStorageKey, JSON.stringify(savedJSON));
    loadList();
  }


  var $list = $('#unit-storage-list');
  var $saveButton = $('#unit-storage-save');
  var $nameInput = $('#unit-storage-name');

  function loadList() {
    $list.html('');
    var json = readUnitJSON();
    for (var name in json) {
      $list.append(createListItem(name));
    }
  }

  function saveCurrentUnit() {
    var date = new Date();
    saveUnitJSON($nameInput.val() || date.toLocaleDateString() + ' ' + date.toLocaleTimeString(), saveunit());
    loadList();
  }

  $saveButton.click(saveCurrentUnit);

  function createListItem(name) {
    var li = document.createElement('li');
    li.className = 'list-group-item';

    var badge = document.createElement('a');
    badge.href = 'javascript:;';
    badge.className = 'badge';
    badge.dataset.name = name;
    badge.innerHTML = '删除';
    badge.addEventListener('click', deleteListener);

    var text = document.createElement('a');
    text.href = 'javascript:;';
    text.dataset.name = name;
    text.innerHTML = 'unit: ' + name;
    text.addEventListener('click', clickListener);

    li.appendChild(badge);
    li.appendChild(text);

    return li;
  }

  function clickListener(e) {
    e.preventDefault();
    loadUnitFromJSON(readUnitJSON(e.target.dataset.name));
    $nameInput.val(e.target.dataset.name);
  }

  function deleteListener(e) {
    e.preventDefault();
    deleteUnitJSON(e.target.dataset.name);
  }

  function saveunit() {
    var member = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
    var saveatt = ['smile', 'pure', 'cool', 'skilllevel', 'cardid', 'mezame', 'gemnum', 'gemsinglepercent', 'gemallpercent', 'gemskill', 'gemacc']
    for (var i = 0; i < 9; i++) {
      for (var j in saveatt) {
        member[i][saveatt[j]] = document.getElementById(saveatt[j] + String(i)).value;
      }
    }
    return JSON.stringify(member);
  }


  loadList();

})();
