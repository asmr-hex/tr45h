// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

// enable fetch mocks
import fetchMock from "jest-fetch-mock"
fetchMock.enableMocks()

beforeEach(() => {
  fetch.resetMocks()
  fetch.mockResponse(req => {
    if (/^https?:\/\/freesound.org\/apiv2\/search\/text\//.test(req.url)) {
      return  new Promise((resolve, reject) => resolve(JSON.stringify({
        results: [
          { previews: { 'preview-hq-mp3': 'https://freesound.org/data/previews/0/test_0-hq.mp3'} },
          { previews: { 'preview-hq-mp3': 'https://freesound.org/data/previews/0/test_1-hq.mp3'} },
          { previews: { 'preview-hq-mp3': 'https://freesound.org/data/previews/0/test_2-hq.mp3'} },
        ]
      })))
    } else if (/^https?:\/\/freesound.org\/data\/previews\//.test(req.url)) {
      return new Promise((resolve, reject) => resolve(JSON.stringify([0, 0, 0, 0, 0])))
    }
  })
})

// mock WebAudio API
import 'web-audio-test-api'
