import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputCard: {
    flex: 1,
    height: 44,
    borderRadius: 22,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    paddingHorizontal: 16,
    flex: 1,
    height: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: '100%',
  },
  textInputLight: {
    color: '#1f2937',
  },
  textInputDark: {
    color: '#ffffff',
  },
  sendIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    marginLeft: 8,
  },
});
