import './index.less';

import React, { FC, useState } from 'react';
import { Layout, Button, Checkbox, Form, Input, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useMutation } from "@apollo/client";
import { useTranslation } from 'react-i18next';
import { updateProfile } from '@/stores/user.store';
import { mutation_forgot_password } from "@/apollo/gqlQuery";
import { setCookie, getHeaders } from "@/utils";
import handlerError from "@/utils/handlerError";
import type { ForgotPasswordParams } from '@/interface/user/login';

const initialValues: ForgotPasswordParams = {
  email: '',
};

const ForgotpasswordForm: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [onForgotPassword] = useMutation(mutation_forgot_password, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { forgot_password } }) => {
      console.log(forgot_password);
      message.success('Forgot password successfully, Please check inbox!');
      setLoading(false);

      navigate(`/login${'?from=' + encodeURIComponent(location.pathname)}`, { replace: true })
    },
    onError(error) {
      setLoading(false);
      handlerError({}, error);
    },
  });

  const onFinished = (input: ForgotPasswordParams) => {
    setLoading(true);
    onForgotPassword({ variables: { input } });
  };

  return (
    <Layout className="login-layout">
      <div className="login-page">
        <Form onFinish={onFinished} className="login-page-form" initialValues={initialValues}>
          <Button
              type="link"
              className="login-link"
              onClick={() => navigate('/login')}>
            {t('<< Back to Login page')}
          </Button>
          <h2>{t('Forgot password')}</h2>
          <Form.Item
            name="Email"
            rules={[
              { required: true, message: t("enterEmailMessage") || '' },
            ]}
          >
            <Input placeholder={t("email") || ''} />
          </Form.Item>
          
          <Form.Item>
            <Button htmlType="submit" type="primary" className="login-page-form_button" loading={loading}>
              {t('send')}
            </Button>
          </Form.Item>
        </Form>

      </div>
    </Layout>
  );
};

export default ForgotpasswordForm;
