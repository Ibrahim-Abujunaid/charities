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
function showElement() {
  document.querySelector('.non2').style.display = 'block';
}
