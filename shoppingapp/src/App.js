import React from 'react';
import './App.css';
import $ from 'jquery';

/* constants for current_page in state of App. Value is the figure number in assignment description */
const PRODUCTS_LIST_PAGE    = 1
const PRODUCT_DETAIL_PAGE   = 3
const LOGIN_PAGE            = 4
const ADD_RESULT_PAGE       = 5
const USER_CART_PAGE        = 7
const CHECK_OUT_RESULT_PAGE = 8

/* component for navigation bar */
class Nav extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      input_category: "",
      input_searchString: ""
    }

    this.handleNavInputChange = this.handleNavInputChange.bind(this)
    this.searchProducts       = this.searchProducts.bind(this)
    this.signinHTML           = this.signinHTML.bind(this)
    this.cart_link_HTML       = this.cart_link_HTML.bind(this)
  }

  handleNavInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  searchProducts() {
    this.props.getProducts(this.state.input_category, this.state.input_searchString)
  }

  /* render top right part HTML (i.e. login link) 
    This will be changed based on whether user is login */
  signinHTML() {
    /* hide Nav if it is login page */
    if (this.props.current_page == LOGIN_PAGE) {
      return ''
    }

    if (this.props.isLogin) {
      return (
        <p>Hello, {this.props.session_info.username} (<a href='/#' onClick={() => this.props.handleSignOut()}>Sign out</a>)</p>
      )
    } else {
      return (
        <p>
          <a href='/#' onClick={() => this.props.changePage(LOGIN_PAGE)}>Sign in</a>
        </p>
      )
    }
  }

  /* render the part where showing user cart's information in Nav */
  cart_link_HTML() {
    if (this.props.isLogin) {
      return (
        <div className='cart_nav' onClick={() => this.props.loadCart()}>
          <p><i class="fa fa-shopping-cart"></i> {this.props.session_info.totalnum} in Cart</p>
        </div>
      )
    }
  }

  render() {
    //hide Nav bar when it is login page
    if (this.props.current_page != LOGIN_PAGE) {
      return (
        <nav>
          <div className="category_link">
            <a href='/#' onClick={() => this.props.getProducts('Phones', '')}>Phones</a>
            <a href='/#' onClick={() => this.props.getProducts('Tablets', '')}>Tablets</a>
            <a href='/#' onClick={() => this.props.getProducts('Laptops', '')}>Laptops</a>
          </div>

          <div className='search_box'>
            <select name="input_category" onChange={this.handleNavInputChange}>
              <option value="">All</option>
              <option value="Phones">Phones</option>
              <option value="Tablets">Tablets</option>
              <option value="Laptops">Laptops</option>
            </select>
            <input
              type="text"
              name="input_searchString"
              value={this.state.input_searchString}
              onChange={this.handleNavInputChange} />
            <button onClick={this.searchProducts}><i class="fa fa-search"></i></button>
          </div>

          {this.cart_link_HTML()}

          <div className='sign_in_nav_wrapper'>
            {this.signinHTML()}
          </div>

        </nav>
      )
    } else {
      /* hide nav bar if it is login page */
      return ''
    }
  }
}

/* component for showing product list */
class Product_List extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    //the requirement of 4 in a row will be done by App.css
    return (
      <div className='product_list'>
        {
          this.props.product_list.map((product) => {
            return (
              <div className='product_object'
                key={product._id}
                id={product._id}
                onClick={() => this.props.getProductDetail(product._id)}>
                <img src={"http://localhost:3001/" + product.productImage}></img>
                <br />
                <a>{product.name}</a>
                <br />
                <a>${product.price}</a>
              </div>
            )
          })
        }
      </div>
    )
  }
}

/* component for showing product detail */
class Product_Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { quantity: 1 }

    this.handleQuantityInputChange = this.handleQuantityInputChange.bind(this)
  }

  /* return current product's JSON in product list */
  getProductObject() {
    return this.props.product_list.find(e => e._id === this.props.current_product_id)
  }

  handleQuantityInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <div className='product_detail_holder'>
        <img src={"http://localhost:3001/" + this.getProductObject().productImage}></img>
        <p>
          {this.getProductObject().name}<br />
          ${this.getProductObject().price}<br />
          {this.props.product_detail.manufacturer}<br />
          {this.props.product_detail.description}
        </p>
        <div className='cart_input_box'>
          <p>Quantity:</p>
          <input
            type="number"
            name="quantity"
            min="1"
            value={this.state.quantity}
            onChange={this.handleQuantityInputChange} />
          <br />
          <button onClick={() => this.props.handleAddCart(this.props.current_product_id, this.state.quantity)}>Add to Cart</button>
        </div>
      </div>
    )
  }
}

/* login component for Content */
class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: "",
      password: ""
    }

    this.handleLoginInputChange = this.handleLoginInputChange.bind(this)
  }

  handleLoginInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <div className='login_form'>
        <label for="username">Username</label>
        <input
          tpye="text"
          name="username"
          id="username"
          value={this.state.username}
          onChange={this.handleLoginInputChange} />
        <br />
        <label for="password">Password</label>
        <input
          tpye="text"
          name="password"
          id="password"
          type="password"
          value={this.state.password}
          onChange={this.handleLoginInputChange} />
        <br />
        <button onClick={() => this.props.handleSignIn(this.state.username, this.state.password)}>Sign in</button>
      </div>
    )
  }
}

/* the component for showing result after successful add cart */
class Result extends React.Component {
  /* return current product's JSON in product list */
  getProductObject() {
    return this.props.product_list.find(e => e._id === this.props.current_product_id)
  }

  render() {
    return (
      <div className='result'>
        <img src={"http://localhost:3001/" + this.getProductObject().productImage}></img>
        <p> &#10004; Added to Cart</p>
      </div>
    )
  }
}

/* the component for showing products in user shopping cart */
class Shopping_Cart extends React.Component {
  constructor(props) {
    super(props);
    this.handleQuantityChange = this.handleQuantityChange.bind(this)
  }

  handleQuantityChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    //check if user want to delete item from cart (ie. quantity is 0)
    if (value != 0) {
      this.props.handleUpdateCart(name, value);
    } else {
      this.props.handleDeleteCart(name);
    }
  }

  render() {
    return (
      <div className='userCart'>
        <h3>Shopping cart</h3>
        <table className='userCartTable'>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Price:</th>
              <th>Quantity:</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.user_cart.cart.map((product, index) => {
                var current_product_info = this.props.user_cart.productsInfo[index]
                return (
                  <tr className='userCartRow'
                    key={product.productId}
                    id={product.productId}>
                    <td className='image_col'><img src={"http://localhost:3001/" + current_product_info.productImage}></img></td>
                    <td className='name_col'><p>{current_product_info.name}</p></td>
                    <td className='price_col'>${current_product_info.price}</td>
                    <td className='quantity_col'><input
                      type="number"
                      min="0"
                      max="10"
                      key={product.productId}
                      id={product.productId}
                      name={product.productId}
                      defaultValue={product.quantity}
                      onChange={this.handleQuantityChange} />
                    </td>
                  </tr>)
              })
            }
            <tr className='total_row'>
              <td colSpan={4}>Cart subtotal ({this.props.user_cart.totalnum} items(s)): ${this.props.getTotalPrice()}</td>
            </tr>
            <tr className='check_out_row'>
              <td colSpan={4}>
                <button onClick={() => this.props.handleCheckOut()}>Proceed to check out</button>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    )
  }
}

/* the component for showing check out result after user clicked 'Proceed to check out' */
class Check_Out_Result extends React.Component {
  render() {
    return (
      <div className='check_out_result'>
        <p>&#10003; You have successfully placed order for {this.props.user_cart.totalnum} item(s)</p>
        <p>${this.props.getTotalPrice()} paid</p>
      </div>
    )
  }
}

/* will dynamicly change according to current_page state */
class Content extends React.Component {
  constructor(props) {
    super(props)

    this.getTotalPrice = this.getTotalPrice.bind(this)
  }

  /* return total price of product in the cart. Passed to Shopping_Cart and Check_Out_Result */
  getTotalPrice() {
    console.log('getTotalPrice() called')
    var total = 0;
    this.props.user_cart.cart.map((product, index) => {
      total += this.props.user_cart.productsInfo[index].price * product.quantity;
    })
    return total
  }

  render() {
    //dynamically change content based on current page
    if (this.props.current_page == PRODUCTS_LIST_PAGE) {
      return <Product_List
        product_list={this.props.product_list}
        getProductDetail={this.props.getProductDetail} />

    } else if (this.props.current_page == PRODUCT_DETAIL_PAGE) {
      return <Product_Detail
        product_detail={this.props.product_detail}
        current_product_id={this.props.current_product_id}
        product_list={this.props.product_list}
        handleAddCart={this.props.handleAddCart}
        changePage={this.props.changePage}
        isLogin={this.props.isLogin} />

    } else if (this.props.current_page == LOGIN_PAGE) {
      return <Login
        handleSignIn={this.props.handleSignIn} />

    } else if (this.props.current_page == ADD_RESULT_PAGE) {
      return <Result
        current_product_id={this.props.current_product_id}
        product_list={this.props.product_list} />

    } else if (this.props.current_page == USER_CART_PAGE) {
      return <Shopping_Cart
        user_cart={this.props.user_cart}
        handleUpdateCart={this.props.handleUpdateCart}
        handleDeleteCart={this.props.handleDeleteCart}
        handleCheckOut={this.props.handleCheckOut}
        getTotalPrice={this.getTotalPrice} />

    } else if (this.props.current_page == CHECK_OUT_RESULT_PAGE) {
      return <Check_Out_Result
        user_cart={this.props.user_cart}
        getTotalPrice={this.getTotalPrice} />
    }
    return ""
  }
}

/* component for footer (eg. '< go back' link and 'continue shopping' link)*/
class Footer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    //dynamically change based on current page
    if (this.props.current_page == PRODUCT_DETAIL_PAGE) {
      return (
        <footer>
          <a onClick={() => this.props.goback()}> &lt; go back</a>
        </footer>
      )
    } else if (this.props.current_page == ADD_RESULT_PAGE || this.props.current_page == CHECK_OUT_RESULT_PAGE) {
      return (
        <footer>
          <a onClick={() => this.props.getProducts("", "")}>continue browsing &#62;</a>
        </footer>
      )
    }
    return ""
  }
}

/* base component of the view */
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogin: false,
      current_page: PRODUCTS_LIST_PAGE,   //for dynamically change component
      product_list: [],                   //for product list page
      current_product_id: [],             //for product detail page
      product_detail: [],                 //for storing result of /loadproduct/:productid
      session_info: [],                   //for storing /getsessioninfo result
      previous_category: "",              //for going back to previous page
      previous_searchString: "",          //same
      previous_page: "",                  //same
      temp_cart: { isSet: false, productid: "", quantity: "" },     //temp save for return from login page to add cart
      user_cart: { cart: [], productsInfo: [], totalnum: 0 }         //for storing result of /loadcart
    }

    this.getProducts = this.getProducts.bind(this)
    this.getSessionInfo = this.getSessionInfo.bind(this)
    this.handleSignIn = this.handleSignIn.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
    this.getProductDetail = this.getProductDetail.bind(this)
    this.goback = this.goback.bind(this)
    this.changePage = this.changePage.bind(this)
    this.handleAddCart = this.handleAddCart.bind(this)
    this.loadCart = this.loadCart.bind(this)
    this.handleUpdateCart = this.handleUpdateCart.bind(this)
    this.handleDeleteCart = this.handleDeleteCart.bind(this)
    this.handleCheckOut = this.handleCheckOut.bind(this)

    this.loadInitialPage();
  }


  /* change product list in state and change current page to product list page */
  getProducts(category, searchString) {
    /* note that the sorting is done in server side */
    console.log('getProducts() is called')
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/loadpage?category=" + category + "&searchstring=" + searchString,
      xhrFields: { withCredentials: true },
      dataType: 'JSON',
      success: function (result) {
        //save previous seach parameter into state
        this.setState({ previous_category: category, previous_searchString: searchString })

        //change page to products list page and update product_list
        this.setState({ current_page: PRODUCTS_LIST_PAGE, product_list: result })
        console.log(this.state)
      }.bind(this)
    })
  }

  /* change session info in state */
  getSessionInfo() {
    console.log('getSessionInfo() is called')
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/getsessioninfo",
      xhrFields: { withCredentials: true },
      dataType: 'JSON',
      success: function (result) {
        this.setState({ session_info: result })
      }.bind(this)
    })
  }

  /* initial page */
  loadInitialPage() {
    console.log('loadInitialPage() is called')
    this.setState({ current_page: PRODUCTS_LIST_PAGE, previous_category: "", previous_searchString: "" })
    this.getProducts("", "");
    this.getSessionInfo();
  }

  /* change current page location (current_page state) */
  changePage(page) {
    console.log('changePage() is called.')
    this.setState({ previous_page: this.state.current_page, current_page: page }, () => {
      console.log(this.state)
    })
  }

  /* handle login when user clicked 'Sign in' in login page */
  handleSignIn(username, password) {
    console.log('handleSingIn() is called')
    if (username == "" || password == "") {
      alert("You must enter username and password")
    } else {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3001/signin',
        data: { username: username, password: password },
        xhrFields: { withCredentials: true },
        success: function (result) {
          if (result.msg == 'Login success') {
            this.setState({ isLogin: true })
            this.getSessionInfo()

            //if it is from after clicking 'add cart', continue add cart
            if (this.state.temp_cart.isSet) {
              this.handleAddCart(this.state.temp_cart.productid, this.state.temp_cart.quantity)
              this.setState({ isSet: false, productid: "", quantity: "" })
            } else {
              this.changePage(this.state.previous_page)
            }
          }
          alert(result.msg)

        }.bind(this)
      })
    }
  }

  /* handle sign out action. Called when user click 'Sign out' link in Nav bar */
  handleSignOut() {
    console.log('handleSignOut() is called')
    $.ajax({
      type: "GET",
      url: 'http://localhost:3001/signout',
      xhrFields: { withCredentials: true },
      success: function (result) {
        if (result != '') {
          //logout fail
          alert(result)
        } else {
          //logout success
          this.setState({ isLogin: false })
          if (this.state.current_page != PRODUCTS_LIST_PAGE && this.state.current_page != PRODUCT_DETAIL_PAGE) {
            this.getProducts("", "")
          }
        }
      }.bind(this)
    })
  }

  /* handle add to cart action. called when user click 'add to cart' in detail page */
  handleAddCart(productid, quantity) {
    console.log('handleAddCart() is called')
    if (this.state.isLogin) {
      $.ajax({
        type: "PUT",
        data: { productid: productid, quantity: quantity },
        url: "http://localhost:3001/addtocart",
        dataType: 'JSON',
        xhrFields: { withCredentials: true },
        success: function (result) {
          if (result.msg == 'Success') {
            console.log(result)
            this.getSessionInfo()
            this.changePage(ADD_RESULT_PAGE)
          } else {
            console.log(result)
            alert('fuck')
          }
        }.bind(this)
      })
    } else {
      //if not yet login, save product to temp_cart, which will retreive after login
      this.setState({ temp_cart: { isSet: true, productid: productid, quantity: quantity } })
      this.changePage(LOGIN_PAGE)

    }
  }

  /* updating product's quantity in cart. Called when quantity in cart page is change */
  handleUpdateCart(productId, quantity) {
    console.log('handleUpdateCart() called');
    $.ajax({
      type: "PUT",
      data: { productid: productId, quantity: quantity },
      url: "http://localhost:3001/updatecart",
      dataType: 'JSON',
      xhrFields: { withCredentials: true },
      success: function (result) {
        if (result.msg != 'Success') {
          alert('cart update fail!');
        } else {
          //update totalnum in session_info, which change 'x in Cart' message in Nav
          var s = this.state.session_info;
          s.totalnum = result.totalnum;
          this.setState({ session_info: s })
          console.log(this.state)

          //load cart again to update user_cart in state
          this.loadCart()
        }
      }.bind(this)
    })
  }

  /* delete product from user's cart. Called when user change quantity to 0 */
  handleDeleteCart(productid) {
    console.log('handleDeleteCart() called')
    $.ajax({
      type: "DELETE",
      url: "http://localhost:3001/deletefromcart/" + productid,
      dataType: 'JSON',
      xhrFields: { withCredentials: true },
      success: function (result) {
        if (result.msg != 'Success') {
          alert('Product delete fail!');
        } else {
          //update totalnum in session_info, which change 'x in Cart' message in Nav
          var s = this.state.session_info;
          s.totalnum = result.totalnum;
          this.setState({ session_info: s })

          //reload cart, which will also update the view
          this.loadCart()
        }
      }.bind(this)

    })
  }

  /* handle check out action. Called when user click 'Proceed to check out' button on cart page */
  handleCheckOut() {
    console.log('handleCheckOut() is called');
    if (this.state.user_cart.cart.length != 0) {
      $.ajax({
        type: "GET",
        url: "http://localhost:3001/checkout",
        xhrFields: { withCredentials: true },
        success: function (result) {
          console.log(result);
          if (result != '') {
            //unsuccessful
            alert(result)
          } else {
            //if checkout successfully
            //update 'xx in Cart' in Nav by load session info again
            this.getSessionInfo();

            this.changePage(CHECK_OUT_RESULT_PAGE);
          }
        }.bind(this)
      })
    }
  }

  /* go back to previous page. Called when 'go back' is clicked */
  goback() {
    this.getProducts(this.state.previous_category, this.state.previous_searchString);
  }

  /* change product_detail in state and change current page to detail page*/
  getProductDetail(productid) {
    console.log('getProductDetail() called')
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/loadproduct/" + productid,
      xhrFields: { withCredentials: true },
      dataType: 'JSON',
      success: function (result) {
        this.setState({ product_detail: result, current_page: PRODUCT_DETAIL_PAGE, current_product_id: productid })
        console.log(this.state)
      }.bind(this)
    })
  }

  /* load cart page. Called when click shopping cart icon and "xx in Cart" in Nav */
  loadCart() {
    console.log('loadCart() called')
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/loadcart",
      xhrFields: { withCredentials: true },
      dataType: 'JSON',
      success: function (result) {
        this.setState({ user_cart: result })
        console.log(this.state)
        this.changePage(USER_CART_PAGE)

      }.bind(this)
    })
  }

  render() {
    return (
      <React.Fragment>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"></link>
        <Nav
          isLogin={this.state.isLogin}
          getProducts={this.getProducts}
          session_info={this.state.session_info}
          handleSignOut={this.handleSignOut}
          changePage={this.changePage}
          current_page={this.state.current_page}
          loadCart={this.loadCart}
        />
        <Content
          current_page={this.state.current_page}
          product_list={this.state.product_list}
          product_detail={this.state.product_detail}
          getProductDetail={this.getProductDetail}
          current_product_id={this.state.current_product_id}
          handleSignIn={this.handleSignIn}
          changePage={this.changePage}
          isLogin={this.state.isLogin}
          handleAddCart={this.handleAddCart}
          user_cart={this.state.user_cart}
          handleUpdateCart={this.handleUpdateCart}
          handleDeleteCart={this.handleDeleteCart}
          handleCheckOut={this.handleCheckOut}
        />
        <Footer
          current_page={this.state.current_page}
          getProducts={this.getProducts}
          goback={this.goback} />
      </React.Fragment>
    )
  }
}

export default App;
