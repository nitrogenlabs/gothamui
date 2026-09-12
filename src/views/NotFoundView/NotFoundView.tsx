/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {memo} from 'react';

import {NotFound} from '../../components/NotFound/NotFound.js';

import type {FC} from 'react';

const NotFoundViewComponent: FC = () => <NotFound />;


export const NotFoundView = memo(NotFoundViewComponent);
NotFoundView.displayName = 'NotFoundView';

export default NotFoundView;
