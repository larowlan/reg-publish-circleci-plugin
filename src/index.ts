import {PublisherPluginFactory} from "reg-suit-interface";
import {CirclePublisher} from './publisher';
import {CirclePreparer} from './preparer';

const pluginFactory: PublisherPluginFactory = () => {
  return {
    preparer: new CirclePreparer(),
    publisher: new CirclePublisher(),
  };
};

export = pluginFactory;
