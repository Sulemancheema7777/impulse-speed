let cartBoxing = [];
for (var i = 0; i < document.querySelector('.cart-packaging').children.length; i++) {
  cartBoxing.push(document.querySelector('.cart-packaging').children[i]);
}

(function(){
 checkCartItems(true);

  document.querySelectorAll('.qtybtn').forEach((item) => {
    item.addEventListener('click', function() {
      const click_option = this.getAttribute('data-qtychange');
      const btn_click = `cart-box-${click_option}`;

      if (document.querySelector('.box-item-input')) {
        const inCart = Number(document.querySelector('.box-item-input').value);

        document.querySelector(`.${btn_click}`).click();
        setTimeout( function(){
          if (click_option === 'plus') {
            document.querySelector('.cart-bundle-input').value = Number(document.querySelector('.box-item-input').value) + 2;
          } else {
            document.querySelector('.cart-bundle-input').value = inCart + 1;
          }
        },500);
      } else {
        const initial = Number(document.querySelector('.cart-bundle-input').value);

        if (click_option === 'plus') {
         document.querySelector('.cart-bundle-input').value = initial + 1;

         setTimeout( function(){
           const vid = document.querySelector('.cart-bundle-input').getAttribute('data-vid');
           if (initial == 2) {
             this.disabled = true;
             addBoxItem(vid,1,false);
           }
         },500);
        } else {
          if (initial > 2) document.querySelector('.cart-bundle-input').value = initial - 1;
        }
      }
    })
  });

  if (document.querySelector('.box-item-input')) {
    document.querySelector('#paidBoxes').checked = true;
    document.querySelector('.cart-bundle-input').value = Number(document.querySelector('.box-item-input').value) + 2;
  };
})();

document.querySelector('[name="CartPageForm"]').addEventListener('submit', function(e) {
  console.log('haha',this)
  const box = this.form.querySelector('.cart-packaging');
  const boxOne = box ? this.form.querySelectorAll('.packagesRadio')[0] : false;
  const boxTwo = box ? this.form.querySelectorAll('.packagesRadio')[1] : false;

  let requiresTerms = false;

  if (box) requiresTerms = true;

  this.querySelector('.cart__checkout').classList.add('btn--loading');

  let proceed = true;

  if (this.querySelector('.cart__terms-checkbox') && !this.querySelector('.cart__terms-checkbox').checked) {
    proceed = false;
  }

  if (box && !boxOne.checked && !boxTwo.checked) {
    proceed = false;
  }

  if (requiresTerms) {
    if (proceed) {
      console.log('yowa')
      // continue to checkout
    } else {
      e.preventDefault()
      alert(theme.strings.cartTermsConfirmation)
      this.querySelector('.cart__checkout').classList.remove('btn--loading')
      if (document.querySelector('#CartDrawer .drawer__scrollable')) document.querySelector('#CartDrawer .drawer__scrollable').scrollTop = document.querySelector('.cart__page--submit-wrapper').previousElementSibling.offsetHeight;
      // e.preventDefault();
      return;
    }
  }
})

document.querySelector('#freeBoxes').addEventListener('click',function() {
  if (document.querySelector('.box-item-input')) {
    let checkoutButtons = document.querySelectorAll('.cart__checkout-wrapper button');
    checkoutButtons.forEach((item) => {item.disabled = true});

    document.querySelector('.box-item-input').value = 0;
    document.querySelector('.cart-box-minus').click();

    setTimeout( function(){
      checkoutButtons.forEach((item) => {item.disabled = false});
    },1500);
  };
});

document.querySelector('#paidBoxes').addEventListener('click', function() {
  let checkoutButtons = document.querySelectorAll('.cart__checkout-wrapper button');

  this.disabled = true;
  checkoutButtons.forEach((item) => {item.disabled = true});

  let cart_count = 0;
  const vid = this.getAttribute('data-vid');

  cart_count = fetchCartCount();

  if(cart_count > 2) {
    const box_count = cart_count - 2;

    if (box_count > 0) addBoxItem(vid,box_count);

  } else {
    checkoutButtons.forEach((item) => {item.disabled = false});
    this.disabled = false;
  }
});

function checkCartItems() {
  let currentChildren = [];

  for (let a = 0; a < document.querySelectorAll('.cart__item').length; a++) {
    currentChildren.push(document.querySelectorAll('.cart__item')[a]);
  }

  if (currentChildren.length == 0) return false;

  let realChildren = currentChildren.filter(function(item2) {
    if (!hasClass(item2,'cart__item-box')) return item2;
  });

  if (realChildren.length == 1 && Number(realChildren[0].querySelector('.js-qty__num').value) == 1) {
    if (document.querySelector('.cart-packaging')) {
      if (document.querySelector('#freeBoxes') && realChildren.length < currentChildren.length) {
        document.querySelector('#freeBoxes').click(false);
        setTimeout(function(){
          document.querySelector('#freeBoxes').checked = false;
          document.querySelector('.cart-packaging').remove();
        }, 1000);
      } else {
        document.querySelector('#freeBoxes').checked = false;
        document.querySelector('.cart-packaging').remove();
      };
    }
  } else if (realChildren.length > 1 || Number(realChildren[0].querySelector('.js-qty__num').value) > 1) {
    if (document.querySelector('.cart-packaging')) document.querySelector('.cart-packaging').remove();
    // if (document.querySelector('.cart-packaging')) document.querySelector('.cart-packaging').style.display = 'block';
    let cartBox = document.createElement('div');
    cartBox.className = 'cart-packaging cart__item-row';
    let counter = 0;

    cartBoxing.forEach((item) => {
     cartBox.appendChild(item);
     counter++;

     if (counter == cartBoxing.length && !document.CartPageForm.querySelector('.cart-packaging')) {
       if (document.querySelector('.cart__page--submit-wrapper')) document.querySelector('.cart__page--submit-wrapper').insertBefore(cartBox, document.querySelector('.cart__page--submit-wrapper').children[0]);
     }
   });
  }
}

function fetchCartCount() {
  let xhttp = new XMLHttpRequest();
  let cart_count

  xhttp.onreadystatechange = function(cart) {
    if (this.readyState == 4 && this.status == 200) {
      const cart = JSON.parse(xhttp.response);
      cart_count = cart.item_count;
    }
  }

  xhttp.open("GET", "/cart.js", false);
  xhttp.send();

  return cart_count;
}

function addBoxItem(id,quantity,alertt = true) {
  let boxItem = {
   'items': [{
    'id': id,
    'quantity': quantity
    }]
  };
  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(boxItem)
  })
  .then(response => {
    //if (alertt) alert("Box Item added");
    window.location.href = '/cart';
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function hasClass(element, className) {
  return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function refreshShipping() {
  let refreshDiv = document.getElementById('cart-shipping-wrapper');
  let request = new XMLHttpRequest();

  request.open("GET", "/cart", false);
  request.send(null);

  let doc = document.implementation.createHTMLDocument("example");
  doc.documentElement.innerHTML = request.responseText;

  let refreshContent = doc.getElementById('cart-shipping-wrapper').innerHTML;
  refreshDiv.innerHTML = refreshContent;
}
