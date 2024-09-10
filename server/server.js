const PROTO_PATH="./restaurant.proto";
const mongoose = require('mongoose');
const Menu = require('../models/menu')
require('dotenv').config()

var grpc = require("@grpc/grpc-js");

var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: async (_,callback)=>{
        const menu = await Menu.find()
        callback(null, { menu });

    },
    get: async (call,callback)=>{
        const menu = await Menu.findOne({id: call.request.id})
        if(!menu) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
        callback(null, menu);
    },
    insert: async (call, callback)=>{
        let menuItem=call.request;
        menuItem.id=uuidv4();

        await Menu.create({ id: menuItem.id, name: menuItem.name, price: menuItem.price })
        callback(null,menuItem);
    },
    update: async (call,callback)=>{
        const menu = await Menu.findOneAndUpdate({id: call.request.id}, {
            ...call.request
        })

        if(!menu){
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
        callback(null,menu);
    },
    remove: async (call, callback) => {
        const menu = await Menu.findOneAndDelete({id: call.request.id})

        if(!menu){
            callback({
                code: grpc.status.NOT_FOUND,
                details: "NOT Found"
            });
        }
        callback(null,{});
    }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to database')
    server.bindAsync(`127.0.0.1:${process.env.PORT}`,grpc.ServerCredentials.createInsecure(), ()=>{ server.start(); });
    console.log("Server running at http://127.0.0.1:" + process.env.PORT);
  })
  .catch((err) => {
    console.log(err)
  }) 