let pageLocalStorage = new Object();
function createNote(columnElementId) {
  let noteUUID = crypto.randomUUID();
  let newNote = `
      <div id="${noteUUID}" class="note-card btn-group mb-2 w-100">
          <div class="container content dropdown dropright w-100">
              <button type="button" id="point-${noteUUID}"  class="btnbtn-primary fa fa-ellipsis-h dropdown-toggle-split" data-toggle="dropdown"></button>
              <div type= "text" id="note-${noteUUID}" draggable="true" class="formatnote d-flex"></div>
              <div class="dropdown-menu">
                  <button type="button" id="delete-${noteUUID}" data-id="${noteUUID}" class="dropdown-item btn-delete">
                      Eliminar
                  </button>
                  <button type="button" id="modify-${noteUUID}" data-id="${noteUUID}" class="dropdown-item btn-update">
                      Modificar
                  </button>
              </div>
          </div>
      </div> `;
  let columnElement = document.getElementById(columnElementId);
  columnElement.innerHTML = newNote + columnElement.innerHTML;
  pageLocalStorage = JSON.parse(localStorage.getItem('list'));
  if(pageLocalStorage == null) {
    pageLocalStorage = {
      noteUUID: {
        id: noteUUID,
        note:'',
        image: null,
        order: 1,
        col: columnElementId
      }
    }
    localStorage.setItem('list',JSON.stringify(pageLocalStorage));
  }else{
    addCreateNote(noteUUID,columnElementId);
  }
  refreshContentNote();
}

function addCreateNote(noteUUID, col){
  pageLocalStorage = JSON.parse(localStorage.getItem('list'));
  pageLocalStorage[noteUUID] = {
    id: noteUUID,
    col: col,
    note: "",
    image: null,
    order: getNewNoteOrderIndex(pageLocalStorage, col)
  };
  localStorage.setItem('list', JSON.stringify(pageLocalStorage));
}

function getNewNoteOrderIndex(pageLocalStorage, col) {
  let countFON=0, countFN=0, countTN=0, countSN = 0;
  let keys = Object.keys(pageLocalStorage);

  for(i=0; i<keys.length; i++){
    if(pageLocalStorage[keys[i]].col == 'FN'){
      countFN++;
    }
    if(pageLocalStorage[keys[i]].col == 'FON'){
      countFON++;
    }
    if(pageLocalStorage[keys[i]].col == 'TN'){
      countTN++;
    }
    if(pageLocalStorage[keys[i]].col == 'SN'){
      countSN++;
    }
  }

  if(col == 'FN'){
    countFN++;
    return countFN;
  }
  if(col == 'FON'){
    countFON++;
    return countFON;
  }
  if(col == 'TN'){
    countTN++;
    return countTN;
  }
  if(col == 'SN'){
    countSN++;
    return countSN;
  }
}

function refreshContentNote(){
  $(".dropdown-item").off("click");
  $(".dropdown-item").click(function () {
    if ($(this).hasClass("btn-delete")) {
      $("#delete-note-modal").modal("show");
      let noteIdToDelete = $(this).attr("data-id");
      $("#yes").off("click");
      $("#yes").click(function () {
        pageLocalStorage = JSON.parse(localStorage.getItem('list'));
        $(`#note-${noteIdToDelete}`).remove();
        $(`#point-${noteIdToDelete}`).remove();
        $(`#note1-${noteIdToDelete}`).remove();
        delete pageLocalStorage[noteIdToDelete];
        localStorage.setItem('list', JSON.stringify(pageLocalStorage));
        $("#delete-note-modal").modal("hide");
      });
    } else if ($(this).hasClass("btn-update")) {
      // Cada vez que se abra el modal
      // uno quiere asignarle lo que va a hacer el click
      // tanto a los botones como de guardar como también
      // el de eliminar las fotos.
      // Limpiamos el modal
      // $("#modify-note-modal").find("input,textarea,select").val("")
      // Abrimos el modal
      $("#modify-note-modal").modal("show");
      // Obtenemos el ID de la nota
      let noteId = $(this).attr("data-id");
      // Le retiramos el evento del botón guardar
      // por si anteriormente tenía uno
      $("#save").off("click");
      // Le asignamos lo que queremos que haga
      // al darle al botón guardar.
      $("#save").click(async function () {
        var inputElement = document.querySelector("#imageNote");
        var file = inputElement.files[0];
        if(file == undefined){
          // Se busca la lista en el local storage
          pageLocalStorage= JSON.parse(localStorage.getItem('list'));
          if(pageLocalStorage[noteId].image == null){
            let noteHTML = `
            <h1 class="formatnote w-100" >${$("#note-body").val()}<br></h1>`;
            // Se agrega la nota al HTML
            $(`#note-${noteId}`).html(noteHTML);
            // Se cambia la nota
            pageLocalStorage[noteId].note = $("#note-body").val();
            // Se guarda en el local storage
            localStorage.setItem('list', JSON.stringify(pageLocalStorage));
        } else {
            let noteHTML = `
            <h1 class="formatnote w-100" >${$("#note-body").val()}<br><img id="image-${noteId}" class="picture w-100" src="${pageLocalStorage[noteId].image}"></h1>`;
            // Se agrega la nota al HTML
            $(`#note-${noteId}`).html(noteHTML);
            // Se cambia la nota
            pageLocalStorage[noteId].note = $("#note-body").val();
            pageLocalStorage[noteId].image = pageLocalStorage[noteId].image;
            // Se guarda en el local storage
            localStorage.setItem('list', JSON.stringify(pageLocalStorage));
          }
          $("#modify-note-modal").modal("hide");
        }else{
          // Se convierte el archivo a base64 para
          // luego introducirlo en src de la etiqueta
          // img de la nota
          var base64 = await toBase64(file);
          let noteHTML = `
                    <h1 class="formatnote w-100" >${$("#note-body").val()}<br><img id="image-${noteId}" class="picture w-100" src="${base64}"></h1>`;
          $(`#note-${noteId}`).html(noteHTML);
          // Tomo el local storage
          pageLocalStorage = JSON.parse(localStorage.getItem('list'));
          // Hago los cambios al objeto
          pageLocalStorage[noteId].image = base64;
          pageLocalStorage[noteId].note= $("#note-body").val();
          // Guardo en el local storage
          localStorage.setItem('list', JSON.stringify(pageLocalStorage));
          // Escondo el modal
          $("#modify-note-modal").modal("hide");
        }
      });

      // Se le asigna el evento al botón de eliminar
      $("#remove-note-image-button").off("click");
      $("#remove-note-image-button").click(function () {
        // Se remueve la imagen
        //$("#modify-note-modal").find("input").val("undefined");
        $(`#image-${noteId}`).remove();;
        // consigo el local storage
        pageLocalStorage= JSON.parse(localStorage.getItem('list'));
        // hago los cambios en el objeto
        pageLocalStorage[noteId].image= null;
        // Guardo en el local storage
        localStorage.setItem('list', JSON.stringify(pageLocalStorage));
      });

      // Se le asigna el evento al botom borrar texto
      $("#erase-note-button").off("click");
      $("#erase-note-button").click(function () {
        // Consigo el local storage
        pageLocalStorage = JSON.parse(localStorage.getItem('list'));
        // Vacío los inputs
        $("#modify-note-modal").find("input,textarea,select").val("");
        // Guardo en el local storage
        localStorage.setItem('list', JSON.stringify(pageLocalStorage));
      });

      // Botón de cancelar
      $("#cancel").off("click");
      $("#cancel").click(function () {
        // Se verifica si cambian la nota
        if($("#note-body").val() == ""){
          $("#note-body").val()= pageLocalStorage[noteId].note;
         }else if($(`#image-${noteId}`).val() == undefined){
          $("#note-body").val()= pageLocalStorage[noteId].image;
        }
      });
    }
  });
}

var columns = [
  document.getElementById("FN"),
  document.getElementById("SN"),
  document.getElementById("TN"),
  document.getElementById("FON")
];

for (let column of columns) {
  Sortable.create(column, {
    group: "shared",
    animation: 150,

    onEnd: function (evt) {

      // Obtengo el local storage
      pageLocalStorage = JSON.parse(localStorage.getItem('list'));
      // Obtengo las llaves del localstorage
      let keys = Object.keys(pageLocalStorage);
      for(let i=0;i<keys.length;i++){
        if(pageLocalStorage[keys[i]].id == evt.item.id){
          // cambio su columna
          pageLocalStorage[evt.item.id].col= evt.to.id;
      }
    }
      var childrenNodeId1 = document.getElementById(`${evt.target.id}`).children;
      var childrenNodeId2 = document.getElementById(`${evt.to.id}`).children;
      let keysChildrenNodeId1 = Object.keys(childrenNodeId1);
      let keysChildrenNodeId2 = Object.keys(childrenNodeId2);
      for(let i=0; i<keysChildrenNodeId1.length; i++){
        if(pageLocalStorage[childrenNodeId1[i].id].col == evt.target.id){
          if(pageLocalStorage[childrenNodeId1[i].id].order != i+1){
            pageLocalStorage[childrenNodeId1[i].id].order=i+1;

          }
        }
      }
      for(let i=0; i<keysChildrenNodeId2.length;i++){
        if(pageLocalStorage[childrenNodeId2[i].id].col == evt.to.id){
          if(pageLocalStorage[childrenNodeId2[i].id].order != i+1){
            pageLocalStorage[childrenNodeId2[i].id].order=i+1;
          }
        }
      }
      localStorage.setItem('list', JSON.stringify(pageLocalStorage));
	},

	onAdd: function (evt) {
  }

  });
  
}

function orderNoteLocalStorage (){
  pageLocalStorage= JSON.parse(localStorage.getItem('list'));
  let keys= Object.keys(pageLocalStorage);
  keys.sort((a,b) => pageLocalStorage[b].order - pageLocalStorage[a].order);
  return keys;
}

var buttonColumns = [
  {
    element: $('#button0'),
    columnId: 'FN'
  },
  {
    element: $('#button01'),
    columnId: 'SN'
  },
  {
    element: $('#button02'),
    columnId: 'TN'
  },
  {
    element: $('#button03'),
    columnId: 'FON'
  }
];

for(let buttonColumn of buttonColumns){
  buttonColumn.element.click(function () {
    createNote(buttonColumn.columnId);
  });
}

function printNoteHTML(){
  pageLocalStorage = JSON.parse(localStorage.getItem('list'));
  let keysNoteOrder = orderNoteLocalStorage();
  if(keysNoteOrder==null){
    return;
  }

  for(let i=0; i<keysNoteOrder.length; i++){

    if(pageLocalStorage[keysNoteOrder[i]].image==null){
    let newNote = `
    <div id="${pageLocalStorage[keysNoteOrder[i]].id}" class="note-card btn-group mb-2 w-100">
        <div class="container content dropdown dropright w-100">
            <button type="button" id="point-${pageLocalStorage[keysNoteOrder[i]].id}"  class="btnbtn-primary fa fa-ellipsis-h dropdown-toggle-split" data-toggle="dropdown"></button>
            <div type= "text" id="note-${pageLocalStorage[keysNoteOrder[i]].id}" draggable="true" class="formatnote d-flex">
            <h1 class="formatnote w-100" >${pageLocalStorage[keysNoteOrder[i]].note}<br></h1>
            </div>
            <div class="dropdown-menu">
                <button type="button" id="delete-${pageLocalStorage[keysNoteOrder[i]].id}" data-id="${pageLocalStorage[keysNoteOrder[i]].id}" class="dropdown-item btn-delete">
                    Eliminar
                </button>
                <button type="button" id="modify-${pageLocalStorage[keysNoteOrder[i]].id}" data-id="${pageLocalStorage[keysNoteOrder[i]].id}" class="dropdown-item btn-update">
                    Modificar
                </button>
            </div>
        </div>
    </div> `;
let columnElement = document.getElementById(pageLocalStorage[keysNoteOrder[i]].col);
columnElement.innerHTML = newNote + columnElement.innerHTML;
    }else{
      let newNote = `
      <div id="${pageLocalStorage[keysNoteOrder[i]].id}" class="note-card btn-group mb-2 w-100">
          <div class="container content dropdown dropright w-100">
              <button type="button" id="point-${pageLocalStorage[keysNoteOrder[i]].id}"  class="btnbtn-primary fa fa-ellipsis-h dropdown-toggle-split" data-toggle="dropdown"></button>
              <div type= "text" id="note-${pageLocalStorage[keysNoteOrder[i]].id}" draggable="true" class="formatnote d-flex">
              <h1 class="formatnote w-100" >${pageLocalStorage[keysNoteOrder[i]].note}<br><img id="image-${pageLocalStorage[keysNoteOrder[i]].id}" class="picture w-100" src="${pageLocalStorage[keysNoteOrder[i]].image}"></h1>
              </div>
              <div class="dropdown-menu">
                  <button type="button" id="delete-${pageLocalStorage[keysNoteOrder[i]].id}" data-id="${pageLocalStorage[keysNoteOrder[i]].id}" class="dropdown-item btn-delete">
                      Eliminar
                  </button>
                  <button type="button" id="modify-${pageLocalStorage[keysNoteOrder[i]].id}" data-id="${pageLocalStorage[keysNoteOrder[i]].id}" class="dropdown-item btn-update">
                      Modificar
                  </button>
              </div>
          </div>
      </div> `;
  let columnElement = document.getElementById(pageLocalStorage[keysNoteOrder[i]].col);
  columnElement.innerHTML = newNote + columnElement.innerHTML;

    }
  }
}

// Source: https://stackoverflow.com/a/57272491
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

printNoteHTML();
refreshContentNote();