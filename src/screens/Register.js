import React, { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import TextBox from "../components/TextBox";
import styled from "styled-components/native";
import { makeRequest } from "../api/request";
import { initialize } from "../helpers/initializer";
import { DeleteUsers, InsertUser } from "../constants/sqlScripts";
import { execute } from "../helpers/sqliteconnector";

const Div = styled.View`
  flex: 1;
`;

export default Register = (props) => {
  const [email, setEmail] = useState("test@test.com");
  const [pinCode, setPinCode] = useState("123123");
  const [confirmPinCode, setConfirmPinCode] = useState("123123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (pinCode !== confirmPinCode) {
      await AsyncAlert("Hatalı İşlem", "Pin kodları eşleşmiyor");
    } else {
      let response = await submitRegisterForm(email, pinCode);
      if (response.isSuccess) {
        await AsyncAlert("İşlem Başarılı", "Kayıt işlemi başarılı");
        try {
          await initialize();
          await saveUser(email, pinCode);
          props.registered();
        } catch (error) {
          await AsyncAlert("İşlem Yapılamadı", `Oluşan hata : ${error}`);
          setIsSubmitting(false);
        }
      } else {
        await AsyncAlert(
          "İşlem Yapılamadı",
          `Sunucudan gelen hata : ${response.errors}`
        );
        setIsSubmitting(false);
      }
    } 
  };
  return (
    <Div>
      <TextBox placeholder="E Mail" text={email} setText={setEmail} />
      <TextBox
        placeholder="Pin"
        text={pinCode}
        setText={setPinCode}
        isSecure
        isNumberOnly
      />
      <TextBox
        placeholder="Pin Onayla"
        text={confirmPinCode}
        setText={setConfirmPinCode}
        isSecure
        isNumberOnly
      />

      {isSubmitting ? (
        <ActivityIndicator color="red" />
      ) : (
        <ColorButton onPress={handleSubmit}>Kayıt Ol</ColorButton>
      )}
    </Div>
  );
};

async function submitRegisterForm(userMail, pinCode) {
  try {
    return await makeRequest(
      "https://pass-mas-api.herokuapp.com/users/register",
      "POST",
      {
        userMail: userMail,
        pinCode: pinCode,
      }
    );
  } catch (err) {
    console.log(err);
    return {
      errors: err,
    };
  }
}

const AsyncAlert = (title, message) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Tamam", onPress: () => resolve("YES") },
        //{text: 'NO', onPress: () => resolve('NO') }
      ],
      { cancelable: false }
    );
  });
};

export function saveUser(userMail, pinCode) {
  return new Promise(async (resolve, reject) => {
    try {
      // await execute(DeleteUsers);
      // console.log("DeleteUsers succ");
      let sqlString = InsertUser(userMail, pinCode);
      await execute(sqlString);    
      console.log("saveUser OK");
      resolve();
    } catch (error) {
      console.log("saveUser error", error);
      reject(error);
    }
  });
}