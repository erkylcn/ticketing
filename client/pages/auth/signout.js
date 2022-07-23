import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request.js';

export default () => {

    const { doRequest, errors } = useRequest({
        url: '/api/users/signout',
        post: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    });

    useEffect(() => {
        doRequest();
    }, []);


    return <div>Signin you auth...</div>;
};