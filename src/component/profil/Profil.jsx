import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Grid,
  Typography,
  Button,
  ButtonBase,
  Paper
} from "@material-ui/core";

var sampleAccount = {
  image: "https://i.kym-cdn.com/entries/icons/original/000/031/727/cover10.jpg",
  name: "Etat Major",
  email: "admin@gr.ma",
  title: "El Jefe",
  role: ["Administrator"],
  password: "password"
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 3,
    padding: '5%'
  },
  paper: {
    padding: theme.spacing(4),
    margin: "auto",
    width: 500
  },
  image: {
    width: 150,
    height: 150
  },
  img: {
    margin: "auto",
    display: "block",
    width: "100%",
    height: "100%"
  }
}));

function Account({ id }) {
  const classes = useStyles();

  return (
    <div style={{padding:'5%'}}>
    <Paper className={classes.paper}>
      <Grid container spacing={6}>
        <Grid item xs={12} container justify="flex-start">
          <Typography variant="h4">Informations Personnel</Typography>
        </Grid>
        <Grid item xs={12} container>
          <Grid item container direction="column" align="start" spacing={1}>
            <Typography gutterBottom variant="h5">
              {id.name}
            </Typography>
            <Typography variant="body1" gutterBottom color="textSecondary">
              Title: {id.title}
            </Typography>
            {id.role.length == 1 ? (
              <Typography variant="body2" color="textSecondary">
                Role: {id.role[0]}
              </Typography>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Roles: {id.role.toString()}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary">
              Email: {id.email}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
    </div>
  );
}

function PasswordMgmt({ id }) {
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [correctPassword, setCorrectPassword] = useState(false);
  const [change, setChange] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const classes = useStyles();
  const correctPW = "password";

  function validateNewPassword() {
    var check =
      currPassword === correctPW && newPassword === confirmNewPassword;
    console.log(check);
    setSubmittable(check);
  }

  return (
    <Paper className={classes.paper}>
      <Grid container direction="column" spacing={4}>
        <Grid container justify="flex-start">
          <Typography variant="h4">Password Mangement</Typography>
        </Grid>
        <Grid item>
          <TextField
            label="Current Password"
            variant="outlined"
            type="password"
            fullWidth
            onChange={(e) => setCurrPassword(e.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            disabled={currPassword.length == 0}
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
          />
        </Grid>
        <Grid item>
          <TextField
            disabled={currPassword.length == 0}
            onChange={() => validateNewPassword()}
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
          />
        </Grid>
        <Grid container justify="flex-end">
          <Button disabled={submittable} variant="contained" color="primary">
            Submit
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
export default function Profile({ id = sampleAccount }) {
  const [profileImg, setprofileImg] = useState(id.image);
  const [name, setName] = useState(id.name);
  const [email, setEmail] = useState(id.email);
  const [edited, setEdited] = useState(false);
  const classes = useStyles();
  return (
    <Grid container direction="column" justify="center" spacing={5}>
      <Grid item>
        <Account id={id} />
      </Grid>
      <Grid item>
        <PasswordMgmt id={id} />
      </Grid>
    </Grid>
  );
}
