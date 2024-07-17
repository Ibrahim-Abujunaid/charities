document.addEventListener('DOMContentLoaded', function() {
  const tabElement = document.querySelector('a.add[data-bs-toggle="tab"]');
  const nonElement = document.querySelector('.non');

  if (tabElement && nonElement) {
      tabElement.addEventListener('shown.bs.tab', function() {
          nonElement.style.display = 'block';
      });

      const otherTabs = document.querySelectorAll('a[data-bs-toggle="tab"]:not(.add)');
      otherTabs.forEach(function(tab) {
          tab.addEventListener('shown.bs.tab', function() {
              nonElement.style.display = 'none';
          });
      });
  }




  const tabElement1 = document.querySelector('a.add1[data-bs-toggle="tab"]');
  const nonElement1 = document.querySelector('.non1');

  if (tabElement1 && nonElement1) {
      tabElement1.addEventListener('shown.bs.tab', function() {
          nonElement1.style.display = 'block';
      });

      const otherTabs1 = document.querySelectorAll('a[data-bs-toggle="tab"]:not(.add1)');
      otherTabs1.forEach(function(tab) {
          tab.addEventListener('shown.bs.tab', function() {
              nonElement1.style.display = 'none';
          });
      });
  }
  
});

const tabElement2 = document.querySelector('a.add2[data-bs-toggle="tab"]');
const nonElement2 = document.querySelector('.non2');

if (tabElement2 && nonElement2) {
    tabElement2.addEventListener('shown.bs.tab', function() {
        nonElement2.style.display = 'block';
    });

    const otherTabs2 = document.querySelectorAll('a[data-bs-toggle="tab"]:not(.add2)');
    otherTabs2.forEach(function(tab) {
        tab.addEventListener('shown.bs.tab', function() {
            nonElement2.style.display = 'none';
        });
    });
}

function showElement() {
  document.querySelector('.non2').style.display = 'block';
}

const deleteButtons = document.querySelectorAll(".fa-trash-can");

deleteButtons.forEach(button => {
  button.addEventListener("click", (event) => {
    swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover!',
      icon: 'error',
      buttons: {
        cancel: {
          text: 'Cancel',
          value: null,
          visible: true,
          className: 'btn btn-default',
          closeModal: true,
        },
        confirm: {
          text: 'Delete',
          value: true,
          visible: true,
          className: 'btn btn-danger',
          closeModal: true
        }
      }
    });
  });
});