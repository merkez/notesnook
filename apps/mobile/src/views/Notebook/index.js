import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Platform,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import NavigationService from '../../services/NavigationService';
import {
  COLOR_SCHEME,
  SIZE,
  br,
  ph,
  pv,
  opacity,
  FONT,
  WEIGHT,
} from '../../common/common';
import Icon from 'react-native-vector-icons/Feather';
import {Reminder} from '../../components/Reminder';
import {ListItem} from '../../components/ListItem';
import {Header} from '../../components/header';
import NoteItem from '../../components/NoteItem';
import {NotebookItem} from '../../components/NotebookItem';
import {Search} from '../../components/SearchInput';

const w = Dimensions.get('window').width;
const h = Dimensions.get('window').height;

export const Notebook = ({navigation}) => {
  const [colors, setColors] = useState(COLOR_SCHEME);
  const params = navigation.state.params;
  return (
    <SafeAreaView
      style={{
        height: '100%',
      }}>
      <KeyboardAvoidingView
        style={{
          height: '100%',
        }}>
        <Header colors={colors} heading={params.title} canGoBack={false} />
        <Search />
        <FlatList
          style={{
            width: '100%',
          }}
          data={params.notebook.topics}
          ListHeaderComponent={
            <>
              {params.hideMore ? null : (
                <TouchableOpacity
                  activeOpacity={opacity}
                  onPress={() => {
                    setAddNotebook(true);
                  }}
                  style={{
                    borderWidth: 1,
                    borderRadius: 5,
                    width: '90%',
                    marginHorizontal: '5%',
                    paddingHorizontal: ph,
                    borderColor: '#f0f0f0',
                    paddingVertical: pv + 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}>
                  <Text
                    style={{
                      fontSize: SIZE.md,
                      fontFamily: WEIGHT.bold,
                      color: colors.pri,
                    }}>
                    View All Notes
                  </Text>
                </TouchableOpacity>
              )}
            </>
          }
          renderItem={({item, index}) => (
            <NotebookItem
              hideMore={params.hideMore}
              isTopic={true}
              item={item}
              index={index}
              colors={colors}
            />
          )}
        />
        <TouchableOpacity
          activeOpacity={opacity}
          onPress={() => {
            setAddNotebook(true);
          }}
          style={{
            borderWidth: 1,
            borderRadius: 5,
            width: '90%',
            marginHorizontal: '5%',
            paddingHorizontal: ph,
            borderColor: '#f0f0f0',
            paddingVertical: pv + 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
            backgroundColor: colors.accent,
          }}>
          <Text
            style={{
              fontSize: SIZE.md,
              fontFamily: WEIGHT.semibold,
              color: 'white',
            }}>
            Add a new topic
          </Text>
          <Icon name="plus" color="white" size={SIZE.lg} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

Notebook.navigationOptions = {
  header: null,
};

export default Notebook;
