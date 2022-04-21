const Product = require("../models/product");
const slugify = require("slugify");

exports.create = async (req,res) => {
    try{
        console.log(req.body);
        req.body.slug = slugify(req.body.title);
        const newProduct = await new Product(req.body).save();
        res.json(newProduct);
    } catch (err){
        console.log(err);
        // res.status(400).send("Create product failed");
        res.status(400).json({
            err: err.message,
        });
    }
};

exports.listAll = async (req, res) => {
    console.log('reading products');
    let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();
    
    res.json(products);
};

exports.remove = async (req, res) => {
    try{
        const deleted = await Product.findOneAndRemove({
            slug: req.params.slug,
        }).exec();
        res.json(deleted);
    }catch (err){
        console.log(err);
        return res.status(400).send('Falha ao deletar produto!')
    }
};

exports.read = async (req, res) => {
    try{
        const product = await Product.findOne({
            slug: req.params.slug,
             })
             .populate("category")
             .populate("subs")
             .exec();
        res.json(product);
    }catch (err){
        console.log(err);
        return res.status(400).send('Falha ao encontrar produto !')
    }
};

exports.update = async (req, res) => {
    try{
        if (req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate(
            {slug: req.params.slug},
            req.body, 
            {new: true}
        ).exec();
        res.json(updated);
    } catch (err) {
        console.log('PRODUCT UPDATE ERROR: ', err);
        res.status(400).json({
            err: err.message,
        });
    }

}

exports.list = async (req, res) => {

    try{
        const {sort, order, page} = req.body;
        const currentPage = page || 1;
        const perPage = 4;

        const products = await Product.find({})
        .skip((currentPage - 1) * perPage)
        .populate('category')
        .populate('subs')
        .sort([[sort, order]])
        .limit(perPage)
        .exec();

        res.json(products);
    } catch (err) {
        console.log(err);
    }

}

exports.productsCount = async (req, res) => {

    let total = await Product.find({})
    .estimatedDocumentCount()
    .exec();
    res.json(total);
}

exports.listRelated = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();

    const related = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
    })
    .limit(4)
    .populate('category')
    .populate('subs')
    .exec();

    res.json(related);
};

handleQuery = async (req, res, query) => {
    const products = await Product.find({ $text: { $search: query} })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .exec();

    res.json(products);
}

const handlePrice = async (req, res, price) => {
    try {
        let products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1],
            },
        })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .exec();
        
        res.json(products);
    } catch (err) {
        console.log(err);
    }
};

const handleCategory = async (req, res, category) => {
    try{
        let products = await Product.find({category})
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .exec();
        
        res.json(products);
    }catch (err){
        console.log(err);
    }
}

const handleSub = async (req, res, sub) => {
    try{
        const products = await Product.find({subs: sub})
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .exec();
         
        res.json(products);
    }catch (err){
        console.log(err);
    }
}

// search/filter
exports.searchFilters = async (req,res) => {
    const { query, price, category, sub } = req.body;

    if(query) {
        await handleQuery(req, res, query);
    }

    if(price !== undefined) {
        await handlePrice(req, res, price);
    }

    if(category) {
        await handleCategory(req, res, category);
    }

    if(sub) {
        await handleSub(req, res, sub);
    }   
};