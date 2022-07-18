var express = require('express');
var router = express.Router();

/* GET /loadpage */
router.get('/loadpage', (req, res) => {
    console.log('/loadpage is called')
    var category = req.query.category;
    var searchstring = req.query.searchstring;

    var query;
    if (category == ""){
        //all category is selected
        query = {name: {$regex: searchstring, $options: "$i"}}
    }else{
        query = {category:category, name: {$regex: searchstring, $options: "$i"}}
    }
    
    var db = req.db;
    var col = db.get('productCollection');
    
    // {category: category, name: searchstring},{_id: 1, name:1, price:1, productImage:1}
    col.find(
        query,
        { sort: {name:1}}
    ).then((docs) =>{
        //somehow the projection on col.find() not works
        //so I do the select on JSON string instead
        res.json(docs.map(({_id, name, price, productImage}) => ({_id, name, price, productImage})))
    }).catch(err => {
        console.error(`Fail in /loadpage: ${err}`);
        res.json({msg: err})
    })
})

/* GET /loadproduct/:productid */
router.get('/loadproduct/:productid', (req, res) => {
    console.log('/loadproduct/ is called');
    var productId = req.params.productid;

    var db = req.db;
    var col = db.get('productCollection');

    col.findOne(
        {_id: productId}
    ).then((docs) => {
        res.json({manufacturer: docs.manufacturer, description: docs.description});
    }).catch(err => {
        console.error(`Fail in /loadproduct/: ${err}`);
        res.json({msg: err})
    })
})

/* POST /signin */
router.post('/signin', (req, res) => {
    console.log('/signin is called');
    var username = req.body.username;
    var password = req.body.password;

    var db = req.db;
    var col = db.get('userCollection')

    col.find({username: username, password: password})
        .then((docs) => {
            if (docs.length != 1) {
                console.log('Login failure');
                res.json({msg: 'Login failure'});
            }else{
                console.log('Login success');
                res.cookie('userId', docs[0]._id);
                res.json({msg:'Login success', totalnum: docs[0].totalnum})
            }
        }).catch(err => {
            console.error(`Fail in /signin: ${err}`);
            res.json({msg: err})
        })
})

/* GET /signout */
router.get('/signout', (req, res) => {
    console.log('/signout is called');
    res.clearCookie('userId');
    res.send('')
})

/** GET /getsessioninfo */
router.get('/getsessioninfo', (req,res) => {
    console.log('/getsessioninfo is called');

    console.log(req.cookies.userId)
    if (req.cookies.userId){
        var db = req.db;
        var col = db.get('userCollection');

        col.findOne({_id: req.cookies.userId})
            .then((docs) => {
                res.json({msg: 'Success' ,username: docs.username, totalnum: docs.totalnum})
            })
            .catch(err => {
                console.error(`Fail in /getsessioninfo: ${err}`);
                res.json({msg: err})
            })
    }else{
        res.json({})
    }
})

/* PUT /addtocart */
router.put('/addtocart', (req, res) => {
    console.log('/addtocart is called');
    var productId = req.body.productid;
    var quantity = parseInt(req.body.quantity);

    var db = req.db;
    var col = db.get('userCollection');

    col.findOne({_id: req.cookies.userId}).then((docs) => {
        cart = docs.cart;

        //check if product already in cart
        var product_in_cart = -1;
        for (var i=0; i<cart.length; i++){
            if (cart[i].productId == productId){
                product_in_cart = i;
            }
        }

        var new_cart = cart;
        if (product_in_cart == -1){
            //product not in cart
            new_cart.push({productId: productId, quantity: quantity})
        }else{
            //product in cart, update quantity
            new_cart[product_in_cart].quantity = new_cart[product_in_cart].quantity + quantity
        }

        var new_total = docs.totalnum + quantity;

        col.update({_id: req.cookies.userId}, {$set: {cart: new_cart, totalnum: new_total}})
        .then((result) => {
            if (result.ok != 1) {
                console.log('update fail')
                res.json({msg: 'Update failed'})
            } else {
                console.log('update success')
                res.json({msg: 'Success', totalnum: new_total})
            }
        })

    }).catch(err => {
        console.error(`Fail in /addtocart: ${err}`);
        res.json({msg: err})
    })

})

/* GET /loadcart */
router.get('/loadcart', (req, res) => {
    console.log('called /loadcart');

    var userId = req.cookies.userId;

    var db = req.db;
    var col = db.get('userCollection');

    col.find({_id: userId}).then((userDocs) => {
        var col2 = db.get('productCollection');
        
        col2.find({}).then((productDocs) => {
            //create array of product information which is in user's cart
            var product_array = [];
            for (var i = 0; i < userDocs[0].cart.length; i++){
                var product = productDocs.find(function (post, index){
                    if (post._id.toHexString() == userDocs[0].cart[i].productId){
                        return true;
                    }
                })
                product_array.push({name: product.name, price: product.price, productImage: product.productImage})
            }

            res.json({cart: userDocs[0].cart, totalnum: userDocs[0].totalnum, productsInfo: product_array})
        }).catch(err => {
            console.error(`Fail in getting productList in /loadcart: ${err}`);
            res.json({msg: err})
        })

    }).catch(err => {
        console.error(`Fail in getting userCollection in /loadcart: ${err}`);
        res.json({msg: err})
    })

})

/* PUT /updatecart */
router.put('/updatecart', (req, res) => {
    console.log('called /updatecart');

    var userId = req.cookies.userId;

    var productId = req.body.productid;
    var quantity = parseInt(req.body.quantity);

    var db = req.db;
    var col = db.get('userCollection')

    col.find({_id: userId}).then((docs) => {
        var current_cart = docs[0].cart
        var change;
        for (var i = 0; i < current_cart.length; i++){
            if (current_cart[i].productId == productId){
                change = quantity - current_cart[i].quantity
                current_cart[i].quantity = quantity
            }
        }
        var new_total = docs[0].totalnum + change
        
        col.update({_id: userId}, {$set: {cart: current_cart, totalnum: new_total}}).then((result) => {
            if (result.ok != 1){
                console.log('update fail');
                res.json({msg: 'Update fail'})
            } else {
                res.json({msg: 'Success', totalnum: new_total})
            }
        })
    }).catch(err => {
        console.error(`Fail in getting userCollection in /updatecart: ${err}`);
        res.json({msg: err})
    })

})

/* DELETE /deletefromcart/:productid */
router.delete('/deletefromcart/:productid', (req, res) => {
    var productId = req.params.productid;

    var db = req.db;
    var col = db.get('userCollection');

    col.find({_id: req.cookies.userId}).then((docs) => {
        var current_cart = docs[0].cart;
        var l = current_cart.length;

        //find location of the product in cart and store quantity
        var quantity_reduce;
        var position = -1;
        for (var i = 0; i < l; i++){
            if (current_cart[i].productId == productId){
                position = i;
                quantity_reduce = current_cart[i].quantity;
            }
        }
        //remove product from current_cart
        current_cart.splice(position, 1);

        var new_total = docs[0].totalnum - quantity_reduce

        col.update({_id: req.cookies.userId}, {$set: {cart: current_cart, totalnum: new_total}}).then((result) => {
            if (result.ok != 1){
                console.log('update fail');
                res.json({msg: 'Update fail'})
            } else {
                res.json({msg: 'Success', totalnum: new_total})
            }
        })
    }).catch(err => {
        console.error(`Fail in /deletefromcart: ${err}`);
        res.json({msg: err})
    })

})

/* GET /checkout */
router.get('/checkout', (req, res) => {
    console.log('/checkout called');

    var db = req.db;
    var col = db.get('userCollection');

    col.update(
        {_id: req.cookies.userId},
        {$set:
            {cart: [], totalnum: 0}
        },
        function (err, result) {
            console.log(`/checkout error message: ${err}`)
            res.send((err === null) ? '' : err)
        }
    )

})

module.exports = router;
