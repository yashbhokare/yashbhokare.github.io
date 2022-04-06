const express = require('express');
const { Client } = require('pg');
const app = express();
const cors = require('cors')
const http = require('http');
const jwt = require("jsonwebtoken");

const client = new Client({
    host: 'ec2-44-202-162-44.compute-1.amazonaws.com',
    port: 5432,
    user: 'backend',
    password: 'CSE545_SS_backend',
    database: 'postgres'
});

app.use(cors());
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded());



var query = "SELECT name, age, gender, address, \"phoneNumber\", \"creditCard\" FROM public.user as u, public.patient as p where u.\"userID\" = p.\"patientID\" and u.\"userID\"=1";

client.connect((err) => {

    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')
    }
})


client.query(query, function (err, result) {
    var res = true;
    if (err) {
        var res = false;
        console.log(err);
    } else {
        console.log(result.rows);
    }
    return res;
});


app.listen(4000, function () {
    console.log("Server is running on localhost 4000");
});

app.get('/api/status', (req, res) => res.json('Working!'));

app.get('/api/hospitalStaff', (req, res) => res.json('HospitalStaff Data'));


// Get Patient user profile
app.get('/api/patient/profile/:Id', (req, res) => {
 

 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT name, age, gender, address, \"phoneNumber\", \"creditCard\" FROM public.user as u, public.patient as p where u.\"userID\" = p.\"patientID\" and u.\"userID\"=" + req.params.Id + "";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows[0])
        }
    });

}
);

// Get Patient Diagnosis
app.get('/api/patient/diagnosis/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT * FROM public.diagnosis as d, public.patient as p where d.\"patientID\" = p.\"patientID\" and p.\"patientID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

}
);

// Get Patient Prescription
app.get('/api/patient/prescription/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT * FROM public.prescription as d, public.patient as p where d.\"patientID\" = p.\"patientID\" and p.\"patientID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

}
);

// Get Patient Report
app.get('/api/patient/report/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT * FROM public.\"labTest\" as l, public.patient as p where l.\"patientID\" = p.\"patientID\" and l.\"patientID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }

    });

}
);

// **Updated
// Fetch Doctor Appointments
app.get('/api/appointments', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    // console.log(req.params.Id);
    var query = "SELECT \"doctorID\", name, \"date\", \"time\" FROM (SELECT \"doctorID\", \"date\", \"time\" FROM public.availability EXCEPT (SELECT \"doctorID\", \"date\", \"time\" FROM public.appointment WHERE status != 'completed' AND status != 'approved')) as availability, public.user WHERE \"doctorID\" = \"userID\"";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
}
);

// Book an appointment
app.post('/api/book/appointment', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    // var query = "INSERT INTO public.appointment(\"patientID\", \"doctorID\", \"time\", date) VALUES ( '46' ,'4' ,'09:00:00-07','2022-04-01T07:00:00.000Z');";

    var query = "INSERT INTO public.appointment(\"patientID\", \"doctorID\", \"time\", date) VALUES (\'" + req.body.patientID + "\',\'" + req.body.doctorID + "\', \'" + req.body.time + "\', \'" + req.body.date + "\');";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err.detail);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
}
);

// View Patient Appointment 
app.get('/api/patient/appointment/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }

    var query = "SELECT * FROM public.appointment WHERE \"patientID\"=\'" + req.params.Id + "\'";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
}
);

// Cancel Appointment
app.post('/api/patient/cancel/appointment', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var query = "DELETE FROM public.appointment WHERE \"patientID\"=\'" + req.body.patientID + "\' AND \"doctorID\"=\'" + req.body.doctorID + "\' AND \"date\"=\'" + req.body.date + "\' AND \"time\"=\'" + req.body.time + "\'";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
}
);

app.get('/api/doctor', (req, res) => res.json('Doctor Data'));

app.get('/api/labStaff', (req, res) => res.json('Lab Staff Data'));

app.get('/api/insuranceStaff', (req, res) => res.json('Lab Staff Data'));

app.get('/api/admin', (req, res) => res.json('Admin Data'));

// Lab Staff


// View all reports
app.get('/api/labStaff/reports', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }

    var query = "SELECT * FROM public.\"labTest\"";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});


// Create lab test report
app.post('/api/labStaff/report/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var record = "\'" + req.body.record + "\'";
    var inputter = "\'" + req.body.inputter + "\'";
    var status = "\'" + req.body.status + "\'";
    var date = "\'" + req.body.date + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var query = "INSERT INTO public.\"labTest\"( \"patientID\", \"testName\", record, inputter, status, date, recommender) VALUES (" + patientID + ", " + testName + "," + record + ", " + inputter + ", " + status + ", " + date + ", " + recommender + ");";
    // var query ="INSERT INTO public.\"testRecommendation\"(\"patientID\", \"doctorID\", date, \"testName\", \"dateFilled\")  VALUES (" + patientID + ", " + recommender + "," + date + ", " + testName + ", " + date  +  ");";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


// Delete lab test report
// app.post('/api/labStaff/report/update', (req, res) => {
//     console.log(req.body);
//     var patientID = "\'" + req.body.patientID + "\'";
//     var testName = "\'" + req.body.testName + "\'";
//     var record = "\'" + req.body.record + "\'";
//     var inputter = "\'" + req.body.inputter + "\'";
//     var status = "\'" + req.body.status + "\'";
//     var date = "\'" + req.body.date + "\'";
//     var recommender = "\'" + req.body.recommender + "\'";
//     var query = "UPDATE INTO public.\"labTest\"( \"patientID\", \"testName\", record, inputter, status, date, recommender) VALUES (" + patientID + ", " + testName + "," + record + ", " + inputter + ", " + status + ", " + date + ", " + recommender + ");";
//     client.query(query, function (err, result) {
//         if (err) {
//             console.log('Error:', err);
//             res.json(err.detail);
//         } else {
//             console.log(result);
//             res.json(true)
//         }
//     });
// });

// Update lab test report
app.post('/api/labStaff/report/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var record = "\'" + req.body.record + "\'";
    var inputter = "\'" + req.body.inputter + "\'";
    var status = "\'" + req.body.status + "\'";
    var date = "\'" + req.body.date + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var query = "UPDATE public.\"labTest\" SET \"testName\"=" + testName + ", record=" + record + ", inputter=" + inputter + ", status=" + status + ", date=" + date + ", recommender=" + recommender + " WHERE \"patientID\"=" + patientID + ";";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


// View patient diagnosis
app.get('/api/labStaff/diagnosis/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.diagnosis as d, public.patient as p where d.\"patientID\" = p.\"patientID\" and p.\"patientID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});


// Lab test request for all patients
app.get('/api/labStaff/labTests', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.\"labTest\" where status='requested'";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});

// Update Lab test request status
app.post('/api/labStaff/labTest/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var status = "\'" + req.body.status + "\'";
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var query = "UPDATE public.\"labTest\" SET \"status\"=" + status + " WHERE \"patientID\"=" + patientID + " AND \"testName\"=" + testName + ";";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


// ************Doctors****************



// View Patient Record

app.get('/api/doctor/patient/records/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.record WHERE \"patientID\"=\'" + req.params.Id + "\'";;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});

// Update Patient Record

app.post('/api/doctor/patient/record/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var record = "\'" + req.body.record + "\'";
    var date = "\'" + req.body.date + "\'";
    var recordID = "\'" + req.body.recordID + "\'";
    var inputter = "\'" + req.body.inputter + "\'";
    var query = "UPDATE public.\"record\" SET \"record\"=" + record + ", date=" + date + " WHERE \"patientID\"=" + patientID + " AND \"inputter\"=" + inputter + " AND \"recordID\"=" + recordID + ";";

    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});



// Create Patient Diagnosis
app.post('/api/doctor/patient/diagnosis/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var date = "\'" + req.body.date + "\'";
    var diagnosis = "\'" + req.body.diagnosis + "\'";
    var query = "INSERT INTO public.diagnosis(\"patientID\", \"doctorID\", date, diagnosis) VALUES (" + patientID + ", " + doctorID + "," + date + ", " + diagnosis + ");";
    // console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});

// Update Patient Diagnosis
app.post('/api/doctor/patient/diagnosis/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var old_date = "\'" + req.body.old_date + "\'";
    var new_date = "\'" + req.body.new_date + "\'";
    var diagnosis = "\'" + req.body.diagnosis + "\'";
    var query = "UPDATE public.diagnosis SET  date=" + new_date + ", diagnosis=" + diagnosis + " WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + old_date + ";"
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


// Delete Patient Diagnosis
app.post('/api/doctor/patient/diagnosis/delete', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var date = "\'" + req.body.date + "\'";
    var diagnosis = "\'" + req.body.diagnosis + "\'";
    var query = "DELETE FROM public.diagnosis WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + date + " AND  diagnosis=" + diagnosis + ";"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Create Prescriptions
app.post('/api/doctor/patient/prescription/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var date = "\'" + req.body.date + "\'";
    var prescription = "\'" + req.body.prescription + "\'";
    var query = "INSERT INTO public.prescription( \"patientID\", \"doctorID\", date, prescription) VALUES (" + patientID + ", " + doctorID + "," + date + " , " + prescription + ");";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Recommend Lab test
app.post('/api/doctor/patient/labtest/recommend', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var date = "\'" + req.body.date + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var dateFilled = "\'" + req.body.dateFilled + "\'";
    var query = "INSERT INTO public.\"testRecommendation\"(\"patientID\", \"doctorID\", date, \"testName\", \"dateFilled\") VALUES (" + patientID + ", " + doctorID + "," + date + ", " + testName + " , " + dateFilled + ");";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Get Patient Report
app.get('/api/doctor/patient/report/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT * FROM public.\"labTest\" as l, public.patient as p where l.\"patientID\" = p.\"patientID\" and l.\"patientID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

}
);


// *********************Patient********************

// Update Patient Diagnosis
app.post('/api/patient/profile/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var age = "\'" + req.body.age + "\'";
    var gender = "\'" + req.body.gender + "\'";
    var address = "\'" + req.body.address + "\'";
    var phoneNumber = "\'" + req.body.phoneNumber + "\'";
    var creditCard = "\'" + req.body.creditCard + "\'";
    var query = "UPDATE public.patient SET  age=" + age + ", gender=" + gender + ", address=" + address + ", \"phoneNumber\"=" + phoneNumber + ", \"creditCard\"=" + creditCard + " WHERE \"patientID\"=" + patientID + ";"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});



// ***************Public**************************

// Doctor Names 
app.get('/api/fetchAllDoctors', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.params.Id);
    var query = "SELECT \"doctorID\", name    FROM public.doctor as d, public.user as u    WHERE d.\"doctorID\" = u.\"userID\";";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});


// ***************Hospital Staff**************************
app.get('/api/fetchAllAppointments', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    // console.log(req.params.Id);
    var query = "SELECT * FROM public.appointment";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});



// approve appointment of patient
app.post('/api/hospitalStaff/patient/appointment/approve', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var hospitalStaffID = "\'" + req.body.hospitalStaffID + "\'";
    var time = "\'" + req.body.time + "\'";
    var date = "\'" + req.body.date + "\'";
    var query = "UPDATE public.appointment SET  approver=" + hospitalStaffID + ", status='approved'" + " WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + date + " AND \"time\"=" + time + ";"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)

        }

    });
});

// decline appointment of patient
app.post('/api/hospitalStaff/patient/appointment/decline', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var hospitalStaffID = "\'" + req.body.hospitalStaffID + "\'";
    var time = "\'" + req.body.time + "\'";
    var date = "\'" + req.body.date + "\'";
    var query = "UPDATE public.appointment SET  approver=" + hospitalStaffID + ", status='denied'" + " WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + date + " AND \"time\"=" + time + ";"
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});




// New request

// Update appointment status
app.post('/api/appointment/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var doctorID = "\'" + req.body.doctorID + "\'";
    var approver = "\'" + req.body.approver + "\'";
    var time = "\'" + req.body.time + "\'";
    var date = "\'" + req.body.date + "\'";
    var status = "\'" + req.body.status + "\'";

    if (req.body.amount) {
        var amount = "\'" + req.body.amount + "\'";
        var query = "UPDATE public.appointment SET  approver=" + approver + ", status=" + status + ", amount=" + amount + " WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + date + " AND \"time\"=" + time + ";"
    } else {
        var query = "UPDATE public.appointment SET  approver=" + approver + ", status=" + status + " WHERE \"patientID\"=" + patientID + " AND \"doctorID\"=" + doctorID + " AND date=" + date + " AND \"time\"=" + time + ";"

    }

    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


app.post('/api/hospitalStaff/record/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var record = "\'" + req.body.record + "\'";
    var inputter = "\'" + req.body.inputter + "\'";
    var date = "\'" + req.body.date + "\'";
    var query = "INSERT INTO public.record(\"patientID\", record, inputter,date) VALUES (" + patientID + ", " + record + "," + inputter + ", " + date + ");";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});

// Doctor to recommend lab test
app.post('/api/doctor/labtest/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var status = "\'" + req.body.status + "\'";
    var dateRecommended = "\'" + req.body.dateRecommended + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var query = "INSERT INTO public.\"labTest\"( \"patientID\", \"testName\", status, \"dateRecommended\", recommender) VALUES (" + patientID + ", " + testName + "," + status + ", " + dateRecommended + ", " + recommender + ");";
    // var query ="INSERT INTO public.\"testRecommendation\"(\"patientID\", \"doctorID\", date, \"testName\", \"dateFilled\")  VALUES (" + patientID + ", " + recommender + "," + date + ", " + testName + ", " + date  +  ");";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});


// Lab Requests
app.get('/api/labstaff/fetchAllLabTests', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    // console.log(req.params.Id);
    var query = "SELECT * FROM public.\"labTest\"";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});


// Lab Staff to update lab test status
app.post('/api/labstaff/labtest/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var status = "\'" + req.body.status + "\'";
    var dateRecommended = "\'" + req.body.dateRecommended + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var query = "UPDATE public.\"labTest\" SET status=" + status + " WHERE \"patientID\"=" + patientID + " AND \"testName\"=" + testName + " AND recommender=" + recommender + " AND \"dateRecommended\"=" + dateRecommended + "";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});

// Lab staff to update lab test data
app.post('/api/labstaff/labtest/report/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var status = "\'" + req.body.status + "\'";
    var dateRecommended = "\'" + req.body.dateRecommended + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var record = "\'" + req.body.record + "\'";
    var inputter = "\'" + req.body.inputter + "\'";
    var dateFilled = "\'" + req.body.dateFilled + "\'";
    var query = "UPDATE public.\"labTest\" SET record=" + record + ", inputter=" + inputter + ", status=" + status + ", \"dateFilled\"=" + dateFilled + " WHERE \"patientID\"=" + patientID + " AND \"testName\"=" + testName + " AND recommender=" + recommender + " AND \"dateRecommended\"=" + dateRecommended + "";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});

// Lab staff to delete lab test data
app.post('/api/labstaff/labtest/report/delete', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    console.log(req.body);
    var patientID = "\'" + req.body.patientID + "\'";
    var testName = "\'" + req.body.testName + "\'";
    var dateRecommended = "\'" + req.body.dateRecommended + "\'";
    var recommender = "\'" + req.body.recommender + "\'";
    var query = "DELETE FROM public.\"labTest\"  WHERE \"patientID\"=" + patientID + " AND \"testName\"=" + testName + " AND recommender=" + recommender + " AND \"dateRecommended\"=" + dateRecommended + "";
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            console.log(result);
            res.json(true)
        }

    });
});



// Add transaction
app.post('/api/transaction/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var payer = "\'" + req.body.patientID + "\'";
    var status = "\'" + req.body.status + "\'";
    var date = "\'" + req.body.date + "\'";
    var transactionAmount = "\'" + req.body.transactionAmount + "\'";
    var query = "INSERT INTO public.transaction(\"transactionAmount\", payer, status, date) VALUES (" + transactionAmount + ", " + payer + ", " + status + ", " + date + ");"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});

app.post('/api/transaction/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var status = "\'" + req.body.status + "\'";
    var transactionID = "\'" + req.body.transactionID + "\'";
    var query = "UPDATE public.transaction	SET status=" + status + " WHERE \"transactionID\"=" + transactionID + ";"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Fetch All transactions

app.get('/api/hospitalStaff/fetachAllTransactions', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.transaction";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});

// Fetch Transaction based on id
app.get('/api/patient/transaction/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.transaction WHERE payer=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});


// Generate Bill
app.post('/api/hospitalStaff/bill/create', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var patientID = "\'" + req.body.patientID + "\'";
    var transactionID = "\'" + req.body.transactionID + "\'";
    var service = "\'" + req.body.service + "\'";
    var amount = "\'" + req.body.amount + "\'";
    var status = "\'" + req.body.status + "\'";
    var date = "\'" + req.body.date + "\'";
    var query = "INSERT INTO public.bill(\"patientID\", \"transactionID\", service, amount, status, date) VALUES (" + patientID + ", " + transactionID + ", " + service + ", " + amount + ", " + status + ", " + date + ");"
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Fetch all bills
app.get('/api/hospitalStaff/fetchAllBills', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.bill";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});


// Fetch bills for patient
app.get('/api/patient/bills/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT * FROM public.bill WHERE \"patientID\"= " + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });

});



// Insurance claim

app.post('/api/patient/insurance/claim/insert', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var transactionID = "\'" + req.body.transactionID + "\'";
    var dateOfRequest = "\'" + req.body.dateOfRequest + "\'";
    var claimedAmount = "\'" + req.body.claimedAmount + "\'";
    var query = "INSERT INTO public.\"insuranceClaim\"(\"transactionID\", \"dateOfRequest\",\"dateOfApprove\",\"claimedAmount\",\"approvedAmount\",date) VALUES (" + transactionID + ", " + dateOfRequest + ", " + dateOfRequest + ", " + claimedAmount + ",0 , " + dateOfRequest + ")";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});


// Fetch all users
app.get('/api/admin/users', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "SELECT \"userID\", name, email, \"accountType\"	FROM public.\"user\"";
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});

app.get('/api/admin/delete/user/:Id', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var query = "DELETE FROM public.\"user\"	WHERE \"userID\"=" + req.params.Id;
    client.query(query, function (err, result) {
        if (err) {
            console.log(err);
            // throw err;
            res.json(err.detail);
        } else {
            res.json(result.rows)
        }
    });
});


// Update  a user
app.post('/api/admin/delete/user/update', (req, res) => {
 
    let token = req.headers["authorization"];
    if (!token) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
    }
    var name = "\'" + req.body.name + "\'";
    var email = "\'" + req.body.email + "\'";
    var accountType = "\'" + req.body.accountType + "\'";
    var userID = "\'" + req.body.userID + "\'";
    var query = "UPDATE public.\"user\" SET name=" + name + ", email=" + email + ", \"accountType\"=" + accountType + "	WHERE \"userID\"=" + userID + ";";
    console.log(query);
    client.query(query, function (err, result) {
        if (err) {
            console.log('Error:', err);
            res.json(err.detail);
        } else {
            // console.log(result);
            res.json(true)
        }

    });
});