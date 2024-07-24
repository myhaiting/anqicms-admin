import { FormattedMessage, history, useModel } from '@umijs/max';
import { Menu } from 'antd';
import React from 'react';
import routes from '../../../config/routes';
import './index.less';

const GlobalHeaderContent: React.FC = (props) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const getSelectKey = () => {
    let selectPath = history.location.pathname;
    if (selectPath.indexOf('/system') === 0) {
      // 截取/system 之后的字符
      selectPath = selectPath.substring(7);
    }
    for (let i in routes) {
      if (routes[i].path && selectPath.indexOf(routes[i].path) === 0) {
        return i;
      }
    }

    return '';
  };

  const selectKey: string = getSelectKey();

  if (!initialState || !initialState.settings) {
    return null;
  }

  const onClickMenu = async (e: any) => {
    let index = e.key;
    let current: any = routes[index] || null;
    if (current != null) {
      // preview单独处理
      if (current.path == '/preview') {
        let baseUrl = '';
        if (!initialState.system) {
          const system = await initialState?.fetchSystemSetting?.();
          if (system) {
            await setInitialState((s) => ({
              ...s,
              system: system,
            }));
          }
          baseUrl = system?.base_url || '';
        } else {
          baseUrl = initialState.system?.base_url || '';
        }
        window.open(baseUrl);
        return;
      }

      let permissions = initialState?.currentUser?.group?.setting?.permissions || [];
      if (current.routes) {
        let url = current.routes[0].path;
        for (let j in current.routes) {
          if (permissions.indexOf(current.routes[j].path) !== -1) {
            url = current.routes[j].path;
            break;
          }
        }
        history.push(url);
      } else {
        history.push(current.path);
      }
    }
  };

  let permissions = initialState?.currentUser?.group?.setting?.permissions || [];
  if (initialState?.currentUser?.id != 1 && initialState?.currentUser?.group_id != 1) {
    for (let i in routes) {
      if (!routes[i].hideInTop && routes[i].name) {
        // 需要处理
        routes[i].unaccessible = true;
        for (let j in permissions) {
          if (permissions[j].indexOf(routes[i].path) === 0) {
            // 存在
            routes[i].unaccessible = false;
            break;
          }
        }
      }
    }
  }

  return (
    <div className="header-nav">
      <Menu onClick={onClickMenu} selectedKeys={[selectKey]} mode="horizontal">
        {routes.map((item: any, index) => {
          if (!item.hideInTop && item.name && !item.unaccessible) {
            return <Menu.Item key={index}><FormattedMessage id={"menu."+item.name} /></Menu.Item>;
          }
          return null;
        })}
      </Menu>
    </div>
  );
};
export default GlobalHeaderContent;
