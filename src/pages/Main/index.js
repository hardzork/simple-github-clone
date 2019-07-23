import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import { Form, Button, List, SearchResultList } from './styles';

export default class Main extends Component {
  state = {
    searchRepo: '',
    searchResultRepos: [],
    repositories: [],
    loading: false,
    inputError: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ searchRepo: e.target.value, inputError: false });
  };

  handleAddRepo = repoId => {
    try {
      this.setState({ loading: true });
      const { repositories, searchResultRepos } = this.state;
      const repo = searchResultRepos.find(r => r.id === repoId);
      const data = {
        name: repo.full_name,
      };
      const existRepo = repositories.find(r => r.name === data.name);
      if (existRepo) {
        throw String('Repositório duplicado');
      }
      this.setState({
        repositories: [...repositories, data],
        searchRepo: '',
        searchResultRepos: [],
      });
    } catch (error) {
      this.setState({
        inputError: true,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSearch = async e => {
    try {
      e.preventDefault();
      this.setState({ loading: true });
      const { searchRepo } = this.state;
      if (!searchRepo) {
        throw String('O campo de pesquisa esta vazio.');
      }
      const response = await api.get('/search/repositories', {
        params: {
          q: searchRepo,
          per_page: 10,
        },
      });
      this.setState({
        searchResultRepos: [...response.data.items],
      });
    } catch (error) {
      this.setState({
        inputError: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const {
      repositories,
      loading,
      searchResultRepos,
      searchRepo,
      inputError,
    } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Meus Repositórios Favoritos
        </h1>
        <Form onSubmit={this.handleSearch} inputError={inputError}>
          <input
            type="text"
            placeholder="Buscar Repositório"
            value={searchRepo}
            onChange={this.handleInputChange}
          />
          <Button type="submit" loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaSearch color="#FFF" size={14} />
            )}
          </Button>
        </Form>
        {searchResultRepos.length > 0 && (
          <SearchResultList>
            {searchResultRepos.map(repo => (
              <li key={String(repo.id)}>
                <button
                  type="button"
                  onClick={() => this.handleAddRepo(repo.id)}
                >
                  <span>{repo.full_name}</span>
                </button>
              </li>
            ))}
          </SearchResultList>
        )}
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
