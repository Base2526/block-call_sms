import "./index.less";

import React, { FC, useEffect, useState } from 'react';
import { Card, Layout, Form, Input, Button, message, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from "@apollo/client";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mutation_register } from "@/apollo/gqlQuery";
import { getHeaders } from "@/utils";
import handlerError from "@/utils/handlerError"

const userNameRegex = /^[a-zA-Z0-9]+$/;
const idCardRegex = /^\d{13}$/;
const phoneNumberRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const initialValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const RegisterPage: FC = (props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [onRegister] = useMutation(mutation_register, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { register } }) => {
      console.log(register);
      message.success('Register successfully!');
      setLoading(false);

      navigate(`/login${'?from=' + encodeURIComponent(location.pathname)}`, { replace: true })
    },
    onError(error) {
      setLoading(false);

      handlerError({}, error)
    }
  });

  const handleSubmit = async (input: any) => {
    console.log("handlerSubmit :", input);
    
    setLoading(true);
    onRegister({ variables: { input } });
  };

  return (
    <Layout className="layout-page">
      <div className="register-page">
        <Form
          form={form}
          initialValues={initialValues}
          onFinish={handleSubmit}
          layout="vertical"
          className="register-page-form"
        >
          <Button
            type="link"
            className="login-link"
            onClick={() => navigate('/login')}
          >
            {t('<< Back to Login page')}
          </Button>
          <h2>REGISTER</h2>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { pattern: userNameRegex, message: "Only allows letters (both uppercase and lowercase) and numbers" }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              {
                pattern: passwordRegex,
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password!' },
              {
                pattern: passwordRegex,
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('The two passwords that you entered do not match!');
                },
              })
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default RegisterPage;