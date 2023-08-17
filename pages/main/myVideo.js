/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {useSelector} from 'react-redux';
import {VideoThumbnail} from '../../components/contents/thumbnailBox';
import axiosInstance from '../../utils/axiosInstance';
import NavigationBar from '../../components/tools/navigationBar';
import {regionList} from '../../constant/themes';
import {themeList} from '../../constant/themes';

export default function MyVideo({navigation, route}) {
  const [view, setView] = useState(0);
  const [videoData, setVideoData] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState('');
  const userId = useSelector(state => state.USER);
  const tagId = useSelector(state => state.TAG);
  const theme = getMatchingThemeNames(tagId, regionList, themeList);

  useEffect(() => {
    if (view === 0) {
      console.log(view);
      if (tagId.length > 0) {
        console.log(theme[0].tagId);
        setSelectedTagId(theme[0].tagId);
        getData();
      }
    } else {
      getDataLike();
    }
  }, [view]);

  useEffect(() => {
    if (selectedTagId !== '') {
      console.log('');
      getData();
    }
  }, [selectedTagId]);

  function getMatchingThemeNames(tagIds, regionLists, themeLists) {
    const matchedRegionThemes = regionLists.filter(region =>
      tagIds.includes(region.tagId),
    );

    const matchedThemeListThemes = themeLists.filter(theme1 =>
      tagIds.includes(theme1.tagId),
    );
    return [...matchedRegionThemes, ...matchedThemeListThemes];
  }

  const Item = ({item}) => (
    <View style={styles.item}>
      <ImageBackground
        style={StyleSheet.absoluteFill}
        source={item.src}
        resizeMode="cover">
        {item.tagId === selectedTagId && (
          <View
            style={{
              ...StyleSheet.absoluteFill,
              backgroundColor: 'rgba(236, 255, 251, 1)',
            }}
          />
        )}

        <TouchableOpacity
          style={styles.touch}
          onPress={() => setSelectedTagId(item.tagId)}>
          <Text
            style={
              item.tagId === selectedTagId ? styles.selectedText : styles.text
            }>
            {item.tagName}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );

  const getData = async () => {
    try {
      const response = await axiosInstance.get(
        `content-slave-service/videos/tagId?q=${selectedTagId}&s=recent&page=0&size=10`,
      );

      setVideoData(response.data.payload.videos);
    } catch (e) {
      console.log(e);
    }
  };

  const getDataLike = async () => {
    try {
      const response = await axiosInstance.get(
        `personalized-service/${userId}/videos/liked?page=0&size=10`,
      );
      const likedVideoIds = response.data.payload.likedVideos.likedVideoIdList;
      // setLikedVideoId(likedVideoIds);

      // likedVideoIds를 사용해서 getLikedVideo 호출
      if (likedVideoIds && likedVideoIds.length > 0) {
        await getLikedVideo(likedVideoIds);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log(e.response.status);
        setVideoData([]);
      }
    }
  };

  const getLikedVideo = async likedVideoIds => {
    try {
      const videoIdString = likedVideoIds.join(',');
      const response = await axiosInstance.get(
        `content-slave-service/videos/videoIds?q=${videoIdString}`,
      );
      setVideoData(response.data.payload.videos);
    } catch (e) {
      console.log(e);
    }
  };

  const handlepress = e => {
    if (view === e) {
      return;
    } else {
      setView(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentsContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {borderTopLeftRadius: 10, borderBottomLeftRadius: 10},
              view === 0
                ? {backgroundColor: '#24D9A7'}
                : {backgroundColor: 'white'},
            ]}
            onPress={() => handlepress(0)}>
            <Text
              style={[styles.buttonText, view === 0 ? {color: 'white'} : {}]}>
              태그
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
              },
              view === 1
                ? {backgroundColor: '#24D9A7'}
                : {backgroundColor: 'white'},
            ]}
            onPress={() => handlepress(1)}>
            <Text
              style={[styles.buttonText, view === 1 ? {color: 'white'} : {}]}>
              좋아요
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.horizontalContainer}>
          {view === 0 && videoData.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{
                alignItems: 'center',
                gap: 20,
                paddingHorizontal: 15,
              }}>
              <View style={styles.areaScroll}>
                {theme.map((e, i) => {
                  return <Item key={i} item={e} />;
                })}
              </View>
            </ScrollView>
          )}
        </View>

        <ScrollView
          style={styles.videoContainer}
          contentContainerStyle={{alignItems: 'center'}}>
          {videoData.length > 0 ? (
            videoData.map((e, i) => {
              return (
                <TouchableOpacity
                  style={styles.videoThumbnailContainer}
                  key={i}
                  onPress={() => navigation.navigate('Play', {video: e})}>
                  <VideoThumbnail key={i} video={e} navigation={navigation} />
                </TouchableOpacity>
              );
            })
          ) : view === 0 ? (
            <Text style={styles.alertText}>태그를 구독해주세요.</Text>
          ) : (
            <Text style={styles.alertText}>좋아요한 영상이 없습니다.</Text>
          )}
        </ScrollView>
      </View>
      <NavigationBar route={route} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#F2F8FF',
  },

  contentsContainer: {
    flex: 1,
  },
  videoContainer: {
    marginTop: 5,
    width: '100%',
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    paddingHorizontal: 15,
  },

  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  horizontalContainer: {marginTop: 15},

  item: {
    borderRadius: 50,
    overflow: 'hidden',
    width: 60,
    height: 60,
    marginRight: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  touch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  areaScroll: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1,
  },
  selectedText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1,
  },
  alertText: {
    fontSize: 23,
    marginTop: 30,
  },
  videoThumbnailContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 17,
    paddingBottom: 10,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
    borderRadius: 10,
  },
});
