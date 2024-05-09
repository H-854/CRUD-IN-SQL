const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require('method-override');
app.use(methodOverride('_method'))
const { v4: uuidv4 } = require('uuid');

app.use(express.urlencoded({extended: true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

let createRandomUser = ()=>{
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password()
    ];
}
// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'appuser',
    password: 'V@nShU2005',
  });

//HOME ROUTE
app.get("/",(req,res)=>{
    let q = "SELECT count(*) FROM user";
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs",{ count });
        });
    }catch(err){
        console.log(err);
        res.send(err);
    };
})

//SHOW ROUTE
app.get("/users",(req,res)=>{
    let q = "SELECT * FROM user";
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.render("show.ejs",{ result });
        })
    }catch(err){
        console.log(err);
    }
});

//EDIT ROUTE
app.get("/users/:id/edit",(req,res)=>{
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user = result[0]
            res.render("edit.ejs",{ user });
        })
    }catch(err){
        console.log(err);
    }
});

app.patch("/users/:id",(req,res)=>{
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    let { username: newUser, password: newPass} = req.body;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            if (result.length === 0) { // If no user found
                res.status(404).send("User not found");
                return;
            }
            
            let user = result[0];
            if(newPass !== user.password){
                res.send("WRONG");
            }
            else {
                let t = `UPDATE user SET username = '${newUser}' WHERE id = '${id}'`;
                try{
                    connection.query(t,(er,reslt)=>{
                        if(er) throw er;
                        res.redirect("/users");
                    })
                }catch(e){
                    console.log(e);
                }
            }
        })
    }catch(err){
        console.log(err);
    }
});

app.get("/users/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/users/new",(req,res)=>{
    let q = "INSERT INTO user (id,username,email,password) VALUES (?)";
    let {username ,password ,email} = req.body;
    let user = [uuidv4(),username,email,password];
    try{
        connection.query(q, [user],(err,result)=>{
            if(err) throw err;
            res.redirect("/");
        })
    }catch(err){
        console.log(err);
    };
})
app.listen(port,()=>{
    console.log("Listening to port : ",port);
});

app.delete("/users/:id",(req,res)=>{
    let { id } = req.params;
    let q = `DELETE FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/users");
        })  
    }catch(err){
        console.log(err);
    }
});